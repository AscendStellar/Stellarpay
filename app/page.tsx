import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-stellar-950/50 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Glow blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-stellar-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stellar-500 to-accent-green flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-lg text-white">StellarPay</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
              <Link href="/auth/signup" className="btn-primary text-sm">Get started free</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stellar-500/10 border border-stellar-500/20 rounded-full text-stellar-400 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-stellar-400 animate-pulse" />
            Built on Stellar · Powered by USDC
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Accept crypto payments
            <br />
            <span className="gradient-text">the simple way</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            StellarPay lets any small business accept USDC stablecoin payments
            via the Stellar blockchain. Create payment links in seconds.
            No coding required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary px-8 py-3.5 text-base">
              Start accepting payments
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link href="/pay/demo" className="btn-secondary px-8 py-3.5 text-base">
              View demo checkout
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '<5s', label: 'Settlement time' },
              { value: '~$0', label: 'Transaction fees' },
              { value: '100%', label: 'Uptime SLA' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to get paid</h2>
            <p className="text-slate-400 max-w-lg mx-auto">From payment links to embeddable buttons, StellarPay has you covered.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 hover:border-stellar-800 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-stellar-500/10 border border-stellar-500/20 flex items-center justify-center mb-4">
                  <span className="text-stellar-400">{f.icon}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Live in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stellar-500 to-accent-green flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Embed preview */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Embed anywhere</h2>
              <p className="text-slate-400 mb-6">
                Paste one snippet into your website and your customers can pay with USDC instantly.
                No redirects. No complex integrations.
              </p>
              <Link href="/auth/signup" className="btn-primary">Get your embed code</Link>
            </div>
            <div className="code-block text-xs leading-relaxed">
              <span className="text-slate-500">{`<!-- StellarPay Checkout Button -->`}</span>{'\n'}
              <span className="text-stellar-400">{'<a'}</span>
              <span className="text-accent-green">{' href'}</span>
              <span className="text-slate-400">{'="https://app.stellarpay.dev/pay/abc123"'}</span>{'\n'}
              {'   '}
              <span className="text-accent-green">{'style'}</span>
              <span className="text-slate-400">{'="...'}</span>
              <span className="text-slate-500">{'/* auto-generated */'}</span>
              <span className="text-slate-400">{'">'}</span>{'\n'}
              {'  '}
              <span className="text-white">{'💎 Pay 25.00 USDC with StellarPay'}</span>{'\n'}
              <span className="text-stellar-400">{'</a>'}</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="card-glass p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Create your free account and start accepting USDC payments on Stellar today.
            </p>
            <Link href="/auth/signup" className="btn-primary px-10 py-4 text-base">
              Create free account
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-stellar-500 to-accent-green" />
              <span>StellarPay © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Built on Stellar · Powered by USDC</span>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-stellar-400 transition-colors">
                Stellar.org →
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

const features = [
  {
    icon: '🔗',
    title: 'Payment Links',
    desc: 'Generate shareable checkout URLs for any product or service. Share via email, SMS, or social media.',
  },
  {
    icon: '⚡',
    title: 'Instant Settlement',
    desc: 'Stellar confirms transactions in under 5 seconds. Funds arrive in your wallet almost instantly.',
  },
  {
    icon: '📊',
    title: 'Live Dashboard',
    desc: 'Track every payment, view transaction history, and monitor your earnings in real-time.',
  },
  {
    icon: '🔒',
    title: 'Non-custodial',
    desc: 'Payments go directly to your Stellar wallet. We never hold your funds.',
  },
  {
    icon: '🌐',
    title: 'Embeddable',
    desc: 'One-line HTML snippet you can paste into any website, Notion page, or email.',
  },
  {
    icon: '🪝',
    title: 'Webhooks',
    desc: 'Get notified instantly when a payment is confirmed. Integrate with your backend or Zapier.',
  },
]

const steps = [
  {
    title: 'Create your account',
    desc: 'Sign up for free. A Stellar wallet is automatically generated and funded for you on testnet.',
  },
  {
    title: 'Create a payment link',
    desc: 'Enter your product name, amount, and currency. We generate a shareable URL instantly.',
  },
  {
    title: 'Get paid in USDC',
    desc: 'Share the link. Customers pay with USDC on Stellar. Funds arrive directly in your wallet.',
  },
]
