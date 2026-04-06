import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ExpandableCardProps {
  children: React.ReactNode
}

export default function ExpandableCard({ children }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!expanded) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [expanded])

  return (
    <div className="expandable-card-wrap">
      <button
        type="button"
        className="q-expand-btn"
        title="Expand to full width"
        onClick={() => setExpanded(true)}
        aria-label="Expand"
      >
        ⤢
      </button>
      {children}
      {expanded && createPortal(
        <div
          className="q-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false) }}
          role="dialog"
          aria-modal="true"
        >
          <div className="expandable-card-modal">
            <button
              ref={closeRef}
              type="button"
              className="q-expand-btn expandable-card-modal-close"
              onClick={() => setExpanded(false)}
              aria-label="Close"
              title="Close (Esc)"
            >
              ✕
            </button>
            {children}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
