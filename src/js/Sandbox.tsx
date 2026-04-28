'use client'

import { useEffect, useState } from 'react'
import SandboxMonaco from './SandboxMonaco'
import SandboxSandpack from './SandboxSandpack'

export default function Sandbox() {
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

  if (useSandpack === null) {
    return (
      <div
        className="card sandbox-wrap"
        style={{ marginTop: 0, minHeight: '14rem', opacity: 0.65 }}
        aria-busy="true"
        aria-label="Loading sandbox"
      />
    )
  }

  return useSandpack ? <SandboxSandpack /> : <SandboxMonaco />
}
