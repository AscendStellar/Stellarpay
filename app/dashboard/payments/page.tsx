'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, truncateAddress, truncateHash, getStellarExplorerUrl } from '@/lib/utils'

interface Payment {
  id: string; amount: number; currency: string; status: string
  createdAt: string; confirmedAt?: string; stellarTxHash?: string
  payerAddress?: string; stellarMemo: string
  checkoutLink?: { productName: string; slug: string }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({ totalEarned: 0, totalConfirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    const qs = filter !== 'ALL' ? `?status=${filter}` : ''
    fetch(`/api/payments${qs}`)
      .then(r => r.json())
      .then(d => { setPayments(d.payments || []); setStats(d.stats || {}) })
      .finally(() => setLoading(false))
  }, [filter])

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending', FAILED: 'badge-failed', EXPIRED: 'badge-expired' }
    return <span className={map[s] || 'badge'}>{s}</span>
  }

  if (loading) return <div className="flex items-center justify-center py-32"><div className="spinner w-8 h-8" /></div>

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 mt-1">All incoming USDC payments</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {['ALL', 'CONFIRMED', 'PENDING', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s ? 'bg-stellar-500/20 text-stellar-300' : 'text-slate-500 hover:text-slate-300'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-sm text-slate-500">Total Earned</p>
          <p className="text-2xl font-bold gradient-text">{formatCurrency(stats.totalEarned)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500">Confirmed Payments</p>
          <p className="text-2xl font-bold text-white">{stats.totalConfirmed}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {payments.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-3xl mb-3">⚡</p>
            <p className="text-slate-400">No {filter !== 'ALL' ? filter.toLowerCase() : ''} payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Tx Hash</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{p.checkoutLink?.productName || '—'}</p>
                      <p className="text-xs text-slate-600 font-mono">{p.stellarMemo}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="px-6 py-4">{statusBadge(p.status)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {p.payerAddress ? truncateAddress(p.payerAddress) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {p.stellarTxHash ? (
                        <a href={getStellarExplorerUrl(p.stellarTxHash)} target="_blank" rel="noopener noreferrer"
                          className="font-mono text-xs text-stellar-400 hover:text-stellar-300">
                          {truncateHash(p.stellarTxHash)} ↗
                        </a>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
