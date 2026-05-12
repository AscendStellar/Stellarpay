'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'

interface CheckoutLink {
  id: string; slug: string; productName: string; description?: string
  amount: number; currency: string; isActive: boolean; createdAt: string
  totalEarned: number; _count: { payments: number }
}

export default function LinksPage() {
  const [links, setLinks] = useState<CheckoutLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  useEffect(() => {
    fetch('/api/checkout')
      .then(r => r.json())
      .then(d => setLinks(d.links || []))
      .finally(() => setLoading(false))
  }, [])

  async function copyLink(slug: string) {
    await navigator.clipboard.writeText(`${appUrl}/pay/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  async function toggleLink(id: string, isActive: boolean) {
    await fetch(`/api/checkout/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setLinks(ls => ls.map(l => l.id === id ? { ...l, isActive: !isActive } : l))
  }

  async function deleteLink(id: string) {
    if (!confirm('Delete this payment link? This cannot be undone.')) return
    await fetch(`/api/checkout/${id}`, { method: 'DELETE' })
    setLinks(ls => ls.filter(l => l.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32"><div className="spinner w-8 h-8" /></div>
  )

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Links</h1>
          <p className="text-slate-400 mt-1">Manage your shareable checkout URLs</p>
        </div>
        <Link href="/dashboard/links/new" className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New link
        </Link>
      </div>

      {links.length === 0 ? (
        <div className="card py-24 text-center">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-slate-300 font-semibold">No payment links yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">Create your first link to start accepting payments</p>
          <Link href="/dashboard/links/new" className="btn-primary">Create payment link</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map(link => (
            <div key={link.id} className="card p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white">{link.productName}</h3>
                    <span className={`badge ${link.isActive ? 'badge-confirmed' : 'badge-expired'}`}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {link.description && (
                    <p className="text-sm text-slate-500 mb-2 truncate">{link.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-stellar-400 bg-stellar-500/10 px-2 py-1 rounded-lg font-mono">
                      {appUrl}/pay/{link.slug}
                    </code>
                    <button onClick={() => copyLink(link.slug)}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1">
                      {copied === link.slug ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-white">{formatCurrency(link.amount, link.currency)}</p>
                  <p className="text-xs text-slate-500">{link._count.payments} payments · earned {formatCurrency(link.totalEarned, link.currency)}</p>
                  <p className="text-xs text-slate-600 mt-1">{formatDate(link.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a href={`${appUrl}/pay/${link.slug}`} target="_blank" rel="noopener noreferrer"
                    className="btn-ghost text-xs px-3 py-1.5">Preview ↗</a>
                  <button onClick={() => toggleLink(link.id, link.isActive)}
                    className="btn-ghost text-xs px-3 py-1.5">
                    {link.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
