import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const ITEMS = ['Profile', 'Settings', 'Notifications', 'Help', 'Sign out']

const IMPL = `function useDropdown(dropdownHeight = 180) {
  const triggerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState({})

  const update = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const placement =
      spaceBelow >= dropdownHeight ? 'bottom'
      : spaceAbove >= dropdownHeight ? 'top'
      : spaceBelow >= spaceAbove   ? 'bottom' : 'top'

    const left = Math.max(8,
      Math.min(rect.left, window.innerWidth - rect.width - 8))

    setStyle({
      position: 'fixed', left, width: rect.width, zIndex: 9999,
      ...(placement === 'bottom'
        ? { top: rect.bottom + 4 }
        : { bottom: window.innerHeight - rect.top + 4 }),
    })
  }, [dropdownHeight])

  useEffect(() => {
    if (!open) return
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, update])

  return { triggerRef, open, setOpen, style }
}`

function getPlacement(rect: DOMRect, dropdownHeight: number): 'top' | 'bottom' {
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  if (spaceBelow >= dropdownHeight) return 'bottom'
  if (spaceAbove >= dropdownHeight) return 'top'
  return spaceBelow >= spaceAbove ? 'bottom' : 'top'
}

export default function DropdownPortalDemo() {
  const DROPDOWN_HEIGHT = 180
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom')
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({})
  const [portalOn, setPortalOn] = useState(true)

  const update = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const p = getPlacement(rect, DROPDOWN_HEIGHT)
    setPlacement(p)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8))
    setDropStyle({
      position: 'fixed',
      left,
      width: rect.width,
      zIndex: 9999,
      ...(p === 'bottom' ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4 }),
    })
  }, [])

  useEffect(() => {
    if (!open) return
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, update])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const menu = open && (
    <div
      ref={dropdownRef}
      className="rdp-menu"
      style={portalOn ? dropStyle : undefined}
      data-placement={placement}
    >
      <div className="rdp-badge">{placement} · {portalOn ? 'portal' : 'inline'}</div>
      {ITEMS.map(item => (
        <button key={item} className="rdp-item" onClick={() => setOpen(false)}>
          {item}
        </button>
      ))}
    </div>
  )

  return (
    <div className="card">
      <div className="card-title">useDropdown — portal positioning</div>
      <p className="card-desc">
        Positions a dropdown <strong>above or below</strong> the trigger based on available viewport
        space, and escapes <code>overflow: hidden</code> containers via a <code>createPortal</code>.
      </p>

      <div className="controls">
        <button
          className={portalOn ? undefined : 'secondary'}
          onClick={() => { setPortalOn(v => !v); setOpen(false) }}
        >
          portal: {portalOn ? 'on' : 'off'}
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          {portalOn ? 'Dropdown escapes the clipping box ✓' : 'Dropdown is clipped by overflow: hidden ✗'}
        </span>
      </div>

      <div className="demo-output rdp-clip-box">
        <p className="rdp-hint">
          This box has <code>overflow: hidden</code>. Toggle portal to see clipping vs escape.
        </p>
        <div style={{ height: 28 }} />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button
            ref={triggerRef}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            Open menu ▾
          </button>
          {!portalOn && menu}
        </div>
        <div style={{ height: 28 }} />
      </div>

      {portalOn && createPortal(menu, document.body)}

      <div className="data-field" style={{ marginTop: '0.25rem' }}>
        <span className="field-key">placement:</span>
        <span className="field-val" style={{ color: 'var(--hit)' }}>{open ? placement : '—'}</span>
      </div>

      <CollapsibleCode label="useDropdown hook" code={IMPL}>
        <Explanation steps={[
          { text: <><code>getBoundingClientRect()</code> gives the trigger's position relative to the viewport — the foundation for all placement math.</> },
          { text: <>Compare <code>spaceBelow</code> and <code>spaceAbove</code> to pick a side; fall back to whichever has more room when neither fits.</> },
          { text: <><code>position: fixed</code> in the portal keeps coordinates in the viewport frame, so parent <code>overflow</code> or <code>transform</code> can't clip it.</> },
          { text: <>Scroll and resize listeners (both on <code>window</code>, scroll in <em>capture</em> phase) keep the menu locked to the trigger as the page moves.</> },
          { text: <>Outside-click uses <code>document mousedown</code> + <code>ref.contains()</code>; cleanup removes listeners when closed to avoid leaks.</> },
        ]} />
      </CollapsibleCode>
    </div>
  )
}
