/**
 * app/api/pay/verify/route.ts
 *
 * Payment verification endpoint — polls the Stellar network to check if
 * a customer has sent the required USDC payment with the correct memo.
 *
 * Called by the checkout page every few seconds while waiting for payment.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { findIncomingPayment, verifyTransaction } from '@/lib/stellar/client'
import { dispatchWebhook } from '@/lib/utils/webhook'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { paymentId, txHash } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })
    }

    // Load the payment record
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        merchant: {
          select: { stellarPublicKey: true, webhookUrl: true, businessName: true },
        },
        checkoutLink: { select: { productName: true } },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Already confirmed — return current status
    if (payment.status === 'CONFIRMED') {
      return NextResponse.json({ status: 'CONFIRMED', payment })
    }

    if (payment.status === 'FAILED' || payment.status === 'EXPIRED') {
      return NextResponse.json({ status: payment.status, payment })
    }

    if (!payment.merchant.stellarPublicKey) {
      return NextResponse.json({ error: 'Merchant wallet not configured' }, { status: 400 })
    }

    let paymentRecord = null

    // Strategy 1: If customer provided a tx hash, verify it directly
    if (txHash) {
      const result = await verifyTransaction(
        txHash,
        payment.merchant.stellarPublicKey,
        payment.stellarMemo,
        payment.amount
      )
      if (result.valid && result.record) {
        paymentRecord = result.record
      }
    }

    // Strategy 2: Scan recent transactions for matching memo + amount
    if (!paymentRecord) {
      paymentRecord = await findIncomingPayment(
        payment.merchant.stellarPublicKey,
        payment.stellarMemo,
        payment.amount
      )
    }

    if (!paymentRecord) {
      // Payment not yet detected on Stellar network
      return NextResponse.json({ status: 'PENDING', payment })
    }

    // ✅ Payment confirmed on Stellar — update database
    const confirmed = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CONFIRMED',
        stellarTxHash: paymentRecord.txHash,
        payerAddress: paymentRecord.from,
        confirmedAt: new Date(paymentRecord.createdAt),
      },
    })

    // Fire webhook if merchant has configured one
    if (payment.merchant.webhookUrl && !payment.webhookSent) {
      dispatchWebhook(payment.merchant.webhookUrl, {
        event: 'payment.confirmed',
        paymentId: confirmed.id,
        amount: confirmed.amount,
        currency: confirmed.currency,
        txHash: paymentRecord.txHash,
        payerAddress: paymentRecord.from,
        productName: payment.checkoutLink.productName,
        businessName: payment.merchant.businessName,
        confirmedAt: confirmed.confirmedAt,
      }).then(() =>
        db.payment.update({
          where: { id: paymentId },
          data: { webhookSent: true },
        })
      ).catch(console.error)
    }

    return NextResponse.json({
      status: 'CONFIRMED',
      payment: confirmed,
      txHash: paymentRecord.txHash,
    })
  } catch (err) {
    console.error('[Pay/Verify]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
