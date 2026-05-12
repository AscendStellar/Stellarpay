/**
 * app/api/payments/route.ts
 * List payments and aggregate stats for the authenticated merchant.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      merchantId: session.merchantId,
      ...(status ? { status: status as 'PENDING' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' } : {}),
    }

    const [payments, total, stats] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          checkoutLink: { select: { productName: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.payment.count({ where }),
      db.payment.aggregate({
        where: { merchantId: session.merchantId, status: 'CONFIRMED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      payments,
      total,
      stats: {
        totalEarned: stats._sum.amount || 0,
        totalConfirmed: stats._count.id,
      },
    })
  } catch (err) {
    console.error('[Payments/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
