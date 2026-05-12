/**
 * app/api/auth/login/route.ts
 * Merchant login endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { createSession, SESSION_COOKIE } from '@/lib/auth/session'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const merchant = await db.merchant.findUnique({ where: { email: data.email } })
    if (!merchant) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(data.password, merchant.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

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
    })

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[Auth/Login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
