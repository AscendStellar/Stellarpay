/**
 * app/api/checkout/[id]/route.ts
 * Get, update, or delete a specific checkout link.
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

    const link = await db.checkoutLink.findFirst({
      where: { id: params.id, merchantId: session.merchantId },
      include: {
        payments: { orderBy: { createdAt: 'desc' } },
        _count: { select: { payments: true } },
      },
    })

    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ link })
  } catch (err) {
    console.error('[Checkout/GET/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const link = await db.checkoutLink.findFirst({
      where: { id: params.id, merchantId: session.merchantId },
    })

    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await db.checkoutLink.update({
      where: { id: params.id },
      data: { isActive: body.isActive ?? link.isActive },
    })

    return NextResponse.json({ link: updated })
  } catch (err) {
    console.error('[Checkout/PATCH/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const link = await db.checkoutLink.findFirst({
      where: { id: params.id, merchantId: session.merchantId },
    })

    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.checkoutLink.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Checkout/DELETE/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
