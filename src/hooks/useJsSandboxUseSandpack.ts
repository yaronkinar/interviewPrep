'use client'

import { useEffect, useState } from 'react'

/**
 * Same toggle as `/js` and `/sandbox` (`jsSandboxUseSandpack` in app settings).
 * Framework lesson embeds use it to choose Sandpack vs Monaco fallback.
 */
export function useJsSandboxUseSandpack(): boolean | null {
  const [useSandpack, setUseSandpack] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/feature-flags', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { jsSandboxUseSandpack?: boolean } | null) => {
        if (!cancelled) setUseSandpack(Boolean(data?.jsSandboxUseSandpack))
      })
      .catch(() => {
        if (!cancelled) setUseSandpack(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return useSandpack
}
