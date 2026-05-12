/**
 * app/api/pay/route.ts
 * Public endpoint — fetch checkout link details for the hosted checkout page.
 * Also creates a pending Payment record when a customer lands on /pay/[slug].
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { generateMemo } from '@/lib/utils'
import { buildPaymentURI, USDC_ASSET } from '@/lib/stellar/client'

const schema = z.object({ slug: z.string() })

// GET /api/pay?slug=abc123 — public, no auth required
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

    const link = await db.checkoutLink.findUnique({
      where: { slug },
      include: {
        merchant: {
          select: { businessName: true, name: true, stellarPublicKey: true },
        },
      },
    })

    if (!link || !link.isActive) {
      return NextResponse.json({ error: 'Checkout link not found or inactive' }, { status: 404 })
    }

    return NextResponse.json({ link })
  } catch (err) {
    console.error('[Pay/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pay — create a pending payment and return payment details
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, customerEmail } = z.object({
      slug: z.string(),
      customerEmail: z.string().email().optional(),
    }).parse(body)

    const link = await db.checkoutLink.findUnique({
      where: { slug },
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            stellarPublicKey: true,
          },
        },
      },
    })

    if (!link || !link.isActive) {
      return NextResponse.json({ error: 'Checkout link not found' }, { status: 404 })
    }

    if (!link.merchant.stellarPublicKey) {
      return NextResponse.json({ error: 'Merchant wallet not configured' }, { status: 400 })
    }

    // Generate a unique memo for this payment — used to match the Stellar tx
    const stellarMemo = generateMemo()

    // Create a PENDING payment record
    const payment = await db.payment.create({
      data: {
        checkoutLinkId: link.id,
        merchantId: link.merchantId,
        amount: link.amount,
        currency: link.currency,
        stellarMemo,
        customerEmail,
        status: 'PENDING',
      },
    })

    // Build a SEP-7 payment URI so customers can open their Stellar wallet
    const paymentUri = buildPaymentURI({
      destination: link.merchant.stellarPublicKey,
      amount: link.amount.toFixed(7),
      assetCode: USDC_ASSET.code,
      assetIssuer: USDC_ASSET.issuer,
      memo: stellarMemo,
    })

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        stellarMemo,
        merchantPublicKey: link.merchant.stellarPublicKey,
        businessName: link.merchant.businessName,
        productName: link.productName,
        description: link.description,
        paymentUri,
      },
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[Pay/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
