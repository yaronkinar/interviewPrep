// src/app/pricing/PricingCards.tsx

'use client'

import { useState } from 'react'
import type { Plan } from '@/lib/models/UserSubscription'
import { openPaddleCheckout } from '@/lib/paddleClient'

interface Props {
  currentPlan: Plan
  isSignedIn: boolean
}

export default function PricingCards({ currentPlan, isSignedIn }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(plan: string) {
    if (!isSignedIn) {
      window.location.href = '/sign-in'
      return
    }
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Free */}
      <div className="rounded-xl border p-6 flex flex-col">
        <div className="mb-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Free</p>
          <p className="text-4xl font-bold">$0</p>
          <p className="text-sm text-muted-foreground mt-1">Forever</p>
        </div>
        <ul className="space-y-2 text-sm flex-1 mb-6">
          <li>✅ 20 questions/day</li>
          <li>✅ 2 learning tracks</li>
          <li>✅ 3 mock interviews/month</li>
          <li>✅ 1 CV analysis/month</li>
          <li>✅ Daily challenge</li>
          <li className="text-muted-foreground">❌ Company-tagged questions</li>
          <li className="text-muted-foreground">❌ All tracks</li>
          <li className="text-muted-foreground">❌ Solve guides</li>
        </ul>
        {currentPlan === 'free' ? (
          <button disabled className="w-full py-2 rounded-lg border text-sm text-muted-foreground">
            Current plan
          </button>
        ) : (
          <div className="h-9" />
        )}
      </div>

      {/* Sprint */}
      <div className="rounded-xl border-2 border-amber-500 p-6 flex flex-col relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          FOR JOB SEEKERS
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide mb-1">Sprint</p>
          <p className="text-4xl font-bold">$25</p>
          <p className="text-sm text-muted-foreground mt-1">One-time · 30 days full access</p>
        </div>
        <ul className="space-y-2 text-sm flex-1 mb-6">
          <li>✅ Everything in Free</li>
          <li>✅ Unlimited questions</li>
          <li>✅ All 8 learning tracks</li>
          <li>✅ Unlimited mock interviews</li>
          <li>✅ Unlimited CV analyses</li>
          <li>✅ Company-tagged questions</li>
          <li>✅ Solve guides & answers</li>
        </ul>
        {currentPlan === 'sprint' ? (
          <button disabled className="w-full py-2 rounded-lg border border-amber-500 text-sm text-amber-500">
            Current plan
          </button>
        ) : (
          <button
            onClick={() => handleCheckout('sprint')}
            disabled={loading === 'sprint'}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading === 'sprint' ? 'Loading...' : 'Get Sprint — $25'}
          </button>
        )}
      </div>

      {/* Pro */}
      <div className="rounded-xl border-2 border-indigo-500 p-6 flex flex-col relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          BEST VALUE
        </div>
        <div className="mb-6">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wide mb-1">Pro</p>
          <p className="text-4xl font-bold">$15<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
          <p className="text-sm text-muted-foreground mt-1">or $120/year — save 33%</p>
        </div>
        <ul className="space-y-2 text-sm flex-1 mb-6">
          <li>✅ Everything in Sprint</li>
          <li>✅ Unlimited access, always</li>
          <li>✅ New content as it ships</li>
          <li>✅ Priority support</li>
          <li>✅ Cancel anytime</li>
        </ul>
        {currentPlan === 'pro' ? (
          <button disabled className="w-full py-2 rounded-lg border border-indigo-500 text-sm text-indigo-400">
            Current plan
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => handleCheckout('pro-monthly')}
              disabled={loading === 'pro-monthly'}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {loading === 'pro-monthly' ? 'Loading...' : 'Get Pro — $15/month'}
            </button>
            <button
              onClick={() => handleCheckout('pro-annual')}
              disabled={loading === 'pro-annual'}
              className="w-full py-2 rounded-lg border border-indigo-500 hover:bg-indigo-500/10 text-indigo-400 text-sm transition-colors disabled:opacity-50"
            >
              {loading === 'pro-annual' ? 'Loading...' : 'Annual — $120/year'}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="col-span-full text-center text-sm text-red-500 mt-4">{error}</p>
      )}
    </div>
  )
}
