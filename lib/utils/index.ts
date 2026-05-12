/**
 * lib/utils/index.ts
 * Shared utility functions used across the application.
 */

import { randomBytes } from 'crypto'

/** Generate a URL-safe random slug (10 chars, lowercase alphanumeric) */
export function generateSlug(): string {
  return randomBytes(6).toString('hex').slice(0, 10)
}

/**
 * Generate a unique Stellar memo for a payment.
 * Stellar text memos are max 28 bytes — keep this short.
 */
export function generateMemo(): string {
  return `SP-${randomBytes(4).toString('hex')}`
}

export function formatCurrency(amount: number, currency = 'USDC'): string {
  return `${amount.toFixed(2)} ${currency}`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function truncateHash(hash: string, chars = 8): string {
  if (!hash) return ''
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

export function getStellarExplorerUrl(txHash: string, network = 'testnet'): string {
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
