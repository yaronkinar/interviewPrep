'use client'

import Link from 'next/link'

interface Props {
  used: number
  limit: number
  feature: 'mockInterview' | 'cvAnalysis'
}

const LABELS: Record<Props['feature'], string> = {
  mockInterview: 'mock interview',
  cvAnalysis: 'CV analysis',
}

export default function UsageCounter({ used, limit, feature }: Props) {
  if (used === 0 || limit === Infinity) return null

  const remaining = limit - used
  const isLastOne = remaining === 1

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm mb-4">
      <span>
        ⚡ <strong>{used} of {limit}</strong> free {LABELS[feature]}s used this month
        {isLastOne && ' — last one!'}
      </span>
      <Link
        href="/pricing"
        className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs whitespace-nowrap ml-3"
      >
        Upgrade for unlimited →
      </Link>
    </div>
  )
}
