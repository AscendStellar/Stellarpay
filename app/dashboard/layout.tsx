'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface Merchant {
  id: string; email: string; name: string; businessName: string; stellarPublicKey?: string
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '▦' },
  { href: '/dashboard/links', label: 'Payment Links', icon: '🔗' },
  { href: '/dashboard/payments', label: 'Transactions', icon: '⚡' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/merchants/me')
      .then(r => { if (!r.ok) throw new Error('Unauthorized'); return r.json() })
      .then(d => setMerchant(d.merchant))
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false))
  }, [router])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!merchant) return null

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 fixed h-full z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-stellar-500 to-accent-green flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-bold text-white">StellarPay</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-stellar-500/15 text-stellar-300 border border-stellar-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Merchant info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stellar-500 to-accent-green flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {merchant.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{merchant.businessName}</p>
              <p className="text-xs text-slate-500 truncate">{merchant.email}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-ghost w-full text-sm text-slate-500 justify-start">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
