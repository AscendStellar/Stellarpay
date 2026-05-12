/**
 * app/api/auth/signup/route.ts
 * Merchant registration endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { createSession, SESSION_COOKIE } from '@/lib/auth/session'
import { generateKeypair, fundTestnetAccount } from '@/lib/stellar/client'
import { encryptSecretKey } from '@/lib/stellar/encryption'

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  businessName: z.string().min(2),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = signupSchema.parse(body)

    // Check if email already taken
    const existing = await db.merchant.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Generate a new Stellar wallet for this merchant
    const keypair = generateKeypair()
    const encryptedSecret = encryptSecretKey(keypair.secretKey)

    // Create merchant record
    const merchant = await db.merchant.create({
      data: {
        email: data.email,
        name: data.name,
        businessName: data.businessName,
        passwordHash,
        stellarPublicKey: keypair.publicKey,
        stellarSecretKey: encryptedSecret,
      },
    })

    // Fund the testnet account so it can receive payments
    // (On mainnet, merchants would need to fund their own account with XLM)
    await fundTestnetAccount(keypair.publicKey).catch(console.error)

    // Create session
    const token = await createSession({
      merchantId: merchant.id,
      email: merchant.email,
      name: merchant.name,
      businessName: merchant.businessName,
    })

    const response = NextResponse.json({
      merchant: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
        businessName: merchant.businessName,
        stellarPublicKey: merchant.stellarPublicKey,
      },
    }, { status: 201 })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[Auth/Signup]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
