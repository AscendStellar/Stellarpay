/**
 * app/api/checkout/route.ts
 * Create and list checkout links for the authenticated merchant.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { getSession } from '@/lib/auth/session'
import { generateSlug } from '@/lib/utils'

const createLinkSchema = z.object({
  productName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive().max(1_000_000),
  currency: z.enum(['USDC', 'EURC']).default('USDC'),
})

// GET /api/checkout — list all checkout links for current merchant
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const links = await db.checkoutLink.findMany({
      where: { merchantId: session.merchantId },
      include: {
        _count: { select: { payments: true } },
        payments: {
          where: { status: 'CONFIRMED' },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute total earned per link
    const enriched = links.map((link) => ({
      ...link,
      totalEarned: link.payments.reduce((sum, p) => sum + p.amount, 0),
      payments: undefined, // Don't expose individual payment data here
    }))

    return NextResponse.json({ links: enriched })
  } catch (err) {
    console.error('[Checkout/GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/checkout — create a new checkout link
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = createLinkSchema.parse(body)

    // Generate a unique URL slug
    const slug = generateSlug()

    const link = await db.checkoutLink.create({
      data: {
        slug,
        merchantId: session.merchantId,
        productName: data.productName,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      link: {
        ...link,
        url: `${appUrl}/pay/${link.slug}`,
        embedCode: generateEmbedCode(link.slug, data.productName, data.amount, data.currency, appUrl),
      },
    }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[Checkout/POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate an embeddable HTML snippet for the merchant's website.
 * Customers can click this button to open the hosted checkout page.
 */
function generateEmbedCode(
  slug: string,
  productName: string,
  amount: number,
  currency: string,
  appUrl: string
): string {
  return `<!-- StellarPay Checkout Button -->
<a href="${appUrl}/pay/${slug}" target="_blank" rel="noopener noreferrer"
   style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;
          background:linear-gradient(135deg,#0ea5e9,#00d4aa);color:white;
          border:none;border-radius:8px;font-family:system-ui,sans-serif;
          font-size:16px;font-weight:600;cursor:pointer;text-decoration:none;
          box-shadow:0 4px 15px rgba(14,165,233,0.3);">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
  Pay ${amount} ${currency} with StellarPay
</a>
<!-- Product: ${productName} | Powered by StellarPay -->`
}
