/**
 * lib/utils/webhook.ts
 * Dispatch webhook notifications to merchants after successful payments.
 * Signs the payload with HMAC-SHA256 so merchants can verify authenticity.
 */

import { createHmac } from 'crypto'

export async function dispatchWebhook(
  url: string,
  payload: Record<string, unknown>
): Promise<void> {
  const secret = process.env.WEBHOOK_SECRET || 'webhook-secret'
  const body = JSON.stringify(payload)

  // Sign the payload so merchants can verify it came from StellarPay
  const signature = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-StellarPay-Signature': `sha256=${signature}`,
      'X-StellarPay-Event': String(payload.event || 'payment'),
      'User-Agent': 'StellarPay-Webhook/1.0',
    },
    body,
    signal: AbortSignal.timeout(10_000), // 10s timeout
  })

  if (!response.ok) {
    throw new Error(`Webhook delivery failed: ${response.status} ${response.statusText}`)
  }
}
