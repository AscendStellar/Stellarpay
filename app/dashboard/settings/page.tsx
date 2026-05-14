'use client'
import { useCallback, useEffect, useState } from 'react'
import { truncateAddress } from '@/lib/utils'

interface Merchant {
  id: string; email: string; name: string; businessName: string
  stellarPublicKey?: string; webhookUrl?: string
}

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [hasTrustline, setHasTrustline] = useState(true)
  const [walletKey, setWalletKey] = useState('')
  const [webhook, setWebhook] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const loadMerchant = useCallback(async () => {
    const res = await fetch('/api/merchants/me')
    const data = await res.json()

    setMerchant(data.merchant)
    setHasTrustline(Boolean(data.hasTrustline))
    setWalletKey(data.merchant.stellarPublicKey || '')
    setWebhook(data.merchant.webhookUrl || '')
  }, [])

  useEffect(() => {
    loadMerchant()
  }, [loadMerchant])

  async function saveWallet() {
    setSaving(true); setMsg('')
    const res = await fetch('/api/merchants/wallet', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stellarPublicKey: walletKey }),
    })
    const data = await res.json()
    if (res.ok) await loadMerchant()
    setSaving(false)
    setMsg(res.ok ? '✓ Wallet address updated' : `Error: ${data.error}`)
  }

  if (!merchant) return <div className="flex items-center justify-center py-32"><div className="spinner w-8 h-8" /></div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your merchant profile and Stellar wallet</p>
      </div>

      {/* Profile */}
      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span>👤</span> Merchant Profile
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Full Name', value: merchant.name },
            { label: 'Business Name', value: merchant.businessName },
            { label: 'Email', value: merchant.email },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
              <span className="text-sm text-slate-500">{f.label}</span>
              <span className="text-sm text-white font-medium">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stellar wallet */}
      <div className="card p-6 mb-5">
        <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
          <span>🌟</span> Stellar Receiving Wallet
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          Payments are sent directly to this Stellar address. You can use the auto-generated wallet or your own.
        </p>
        {merchant.stellarPublicKey && !hasTrustline && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-200">
              ⚠️ Your wallet has no USDC trustline.
            </p>
            <p className="mt-1 text-sm text-amber-100/80">
              Customers will not be able to pay you until you add one.
            </p>
            <a
              href="https://github.com/AscendStellar/Stellarpay/blob/main/docs/trustline.md"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-amber-200 hover:text-amber-100"
            >
              Read the trustline setup guide ↗
            </a>
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="label">Public Key (G...)</label>
            <input type="text" className="input font-mono text-sm" value={walletKey}
              onChange={e => setWalletKey(e.target.value)} placeholder="GABC...XYZ" />
          </div>
          {msg && (
            <p className={`text-sm ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>
          )}
          <button onClick={saveWallet} disabled={saving || !walletKey} className="btn-primary">
            {saving ? <><span className="spinner w-4 h-4" />Saving...</> : 'Update wallet'}
          </button>
        </div>
        {merchant.stellarPublicKey && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-600 mb-1">Testnet explorer</p>
            <a href={`https://stellar.expert/explorer/testnet/account/${merchant.stellarPublicKey}`}
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-stellar-400 hover:text-stellar-300 font-mono">
              {truncateAddress(merchant.stellarPublicKey, 16)} ↗
            </a>
          </div>
        )}
      </div>

      {/* Network info */}
      <div className="card p-6 bg-stellar-900/20 border-stellar-800/40">
        <h2 className="font-semibold text-stellar-300 mb-3 flex items-center gap-2">
          <span>ℹ️</span> Stellar Network Info
        </h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Network', value: 'Testnet' },
            { label: 'Horizon URL', value: 'horizon-testnet.stellar.org' },
            { label: 'Asset', value: 'USDC (Circle)' },
            { label: 'Settlement', value: '~3–5 seconds' },
          ].map(i => (
            <div key={i.label} className="flex justify-between">
              <span className="text-slate-500">{i.label}</span>
              <span className="text-stellar-300 font-mono">{i.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
