'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import ChatReactPreviewMonaco from './ChatReactPreviewMonaco'

const ChatReactPreviewSandpack = lazy(() => import('./ChatReactPreviewSandpack'))

export default function ChatReactPreview() {
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
        className="q-react-preview q-react-preview--page"
        style={{ minHeight: '12rem', opacity: 0.65 }}
        aria-busy="true"
        aria-label="Loading preview"
      />
    )
  }

  if (useSandpack) {
    return (
      <Suspense
        fallback={
          <div className="q-react-preview q-react-preview--page" style={{ minHeight: '12rem' }} aria-busy>
            Loading sandbox…
          </div>
        }
      >
        <ChatReactPreviewSandpack />
      </Suspense>
    )
  }

  return <ChatReactPreviewMonaco />
}
