'use client'
/**
 * components/checkout/QRCodeDisplay.tsx
 * Renders a QR code for the Stellar payment URI (SEP-7).
 * Customers can scan this with their Stellar wallet app to auto-fill payment details.
 */

import { useEffect, useRef } from 'react'

interface Props {
  value: string
  size?: number
}

export default function QRCodeDisplay({ value, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Dynamically import qrcode to avoid SSR issues
    import('qrcode').then(QRCode => {
      if (!canvasRef.current) return
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#e2e8f0',   // slate-200 dots
          light: '#0f172a',  // slate-950 background
        },
        errorCorrectionLevel: 'M',
      })
    })
  }, [value, size])

  return (
    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 inline-block">
      <canvas ref={canvasRef} className="rounded-xl block" />
      <p className="text-xs text-center text-slate-600 mt-2">Scan with Stellar wallet</p>
    </div>
  )
}
