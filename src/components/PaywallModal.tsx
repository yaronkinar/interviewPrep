'use client'

import { useState } from 'react'
import { openPaddleCheckout } from '@/lib/paddleClient'

interface Props {
  open: boolean
  onClose: () => void
  feature: 'mockInterview' | 'cvAnalysis'
}

const FEATURE_LABELS: Record<Props['feature'], string> = {
  mockInterview: 'mock interviews',
  cvAnalysis: 'CV analyses',
}

const FEATURE_EMOJIS: Record<Props['feature'], string> = {
  mockInterview: '🎯',
  cvAnalysis: '📄',
}

const FREE_LIMITS: Record<Props['feature'], string> = {
  mockInterview: '3 free mock interviews',
  cvAnalysis: '1 free CV analysis',
}

export default function PaywallModal({ open, onClose, feature }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleCheckout(plan: string) {
    setError(null)
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Checkout failed')
      }
      const { transactionId } = await res.json()
      if (!transactionId) throw new Error('No transaction returned')
      await openPaddleCheckout(transactionId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{FEATURE_EMOJIS[feature]}</div>
          <h2 className="text-xl font-bold mb-2">
            You&apos;ve used your {FREE_LIMITS[feature]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Unlock unlimited {FEATURE_LABELS[feature]} plus all tracks, solve guides, and company questions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleCheckout('sprint')}
            disabled={loading === 'sprint'}
            className="border-2 border-amber-500 rounded-xl p-4 text-left hover:bg-amber-500/10 transition-colors disabled:opacity-50"
          >
            <p className="font-bold text-amber-500 text-sm">Sprint</p>
            <p className="text-2xl font-black mt-1">$25</p>
            <p className="text-xs text-muted-foreground">30 days, one-time</p>
          </button>
          <button
            onClick={() => handleCheckout('pro-monthly')}
            disabled={loading === 'pro-monthly'}
            className="border-2 border-indigo-500 rounded-xl p-4 text-left bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors disabled:opacity-50"
          >
            <p className="font-bold text-indigo-400 text-sm">Pro</p>
            <p className="text-2xl font-black mt-1">$15<span className="text-sm font-normal">/mo</span></p>
            <p className="text-xs text-muted-foreground">Ongoing · cancel anytime</p>
          </button>
        </div>

        {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

        <button
          onClick={onClose}
          className="w-full text-xs text-muted-foreground hover:text-foreground py-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
