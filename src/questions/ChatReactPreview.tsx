'use client'

import { lazy, Suspense } from 'react'
import { useJsSandboxUseSandpack } from '@/hooks/useJsSandboxUseSandpack'
import ChatReactPreviewMonaco from './ChatReactPreviewMonaco'

const ChatReactPreviewSandpack = lazy(() => import('./ChatReactPreviewSandpack'))

export default function ChatReactPreview() {
  const useSandpack = useJsSandboxUseSandpack()

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
