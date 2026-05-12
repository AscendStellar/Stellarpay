'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewLinkPage() {
  const router = useRouter()
  const [form, setForm] = useState({ productName: '', description: '', amount: '', currency: 'USDC' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ url: string; embedCode: string } | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create link'); return }
      setCreated({ url: data.link.url, embedCode: data.link.embedCode })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copy(text: string, type: 'url' | 'embed') {
    await navigator.clipboard.writeText(text)
    if (type === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
    else { setCopiedEmbed(true); setTimeout(() => setCopiedEmbed(false), 2000) }
  }

  if (created) return (
    <div className="p-8 max-w-2xl">
      <div className="card p-8 text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Payment link created!</h2>
        <p className="text-slate-400 text-sm">Share the URL below or embed the button on your site.</p>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Shareable URL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm text-stellar-400 bg-stellar-500/10 px-3 py-2 rounded-lg font-mono truncate">
              {created.url}
            </code>
            <button onClick={() => copy(created.url, 'url')} className="btn-secondary text-sm flex-shrink-0">
              {copiedUrl ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <a href={created.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-stellar-400 mt-2 transition-colors">
            Preview checkout page ↗
          </a>
        </div>

        <div className="card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Embed Code</p>
          <div className="code-block text-xs mb-3 max-h-48 overflow-y-auto">
            {created.embedCode}
          </div>
          <button onClick={() => copy(created.embedCode, 'embed')} className="btn-secondary text-sm">
            {copiedEmbed ? '✓ Copied' : 'Copy embed code'}
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setCreated(null); setForm({ productName: '', description: '', amount: '', currency: 'USDC' }) }}
            className="btn-secondary flex-1">Create another</button>
          <Link href="/dashboard/links" className="btn-primary flex-1 justify-center">View all links</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/links" className="btn-ghost p-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Payment Link</h1>
          <p className="text-slate-400 mt-0.5">Generate a shareable USDC checkout URL</p>
        </div>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Product / Service Name *</label>
            <input type="text" required className="input" placeholder="e.g. Design consultation"
              value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description <span className="text-slate-600">(optional)</span></label>
            <textarea className="input resize-none" rows={3} placeholder="What are you selling?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <input type="number" required min="0.01" step="0.01" className="input" placeholder="25.00"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span>Transaction fees</span>
              <span className="text-emerald-400 font-medium">~$0.00001</span>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><span className="spinner w-4 h-4" />Creating...</> : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  Generate payment link
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
