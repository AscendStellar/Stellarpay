/**
 * app/api/payments/[id]/route.ts
 * Get a single payment by ID.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payment = await db.payment.findFirst({
      where: { id: params.id, merchantId: session.merchantId },
      include: {
        checkoutLink: true,
        merchant: { select: { businessName: true, stellarPublicKey: true } },
      },
    })

    if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ payment })
  } catch (err) {
    console.error('[Payments/GET/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
