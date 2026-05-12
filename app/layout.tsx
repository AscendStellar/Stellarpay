import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'StellarPay', template: '%s | StellarPay' },
  description: 'Accept stablecoin payments on the Stellar blockchain — instant, borderless, and fee-free.',
  keywords: ['stellar', 'stablecoin', 'USDC', 'payments', 'crypto', 'checkout'],
  openGraph: {
    title: 'StellarPay',
    description: 'Accept stablecoin payments on the Stellar blockchain',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
