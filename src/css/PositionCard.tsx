import { useState } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type PosKey = 'static' | 'relative' | 'absolute' | 'sticky'

const TABS: { id: PosKey; label: string }[] = [
  { id: 'static', label: 'static (default)' },
  { id: 'relative', label: 'relative' },
  { id: 'absolute', label: 'absolute' },
  { id: 'sticky', label: 'sticky' },
]

type Method = {
  description: string
  css: string
  steps: string[]
}

const METHODS: Record<PosKey, Method> = {
  static: {
    description:
      'The default. The box stays in normal flow; top/right/bottom/left and z-index are ignored.',
    css: `.box {
  position: static; /* default */
  top: 20px;        /* ignored */
  left: 40px;       /* ignored */
}`,
    steps: [
      'Every element starts as `position: static`.',
      'Offset properties (top/right/bottom/left) have no effect on static boxes.',
      'The box participates in normal document flow alongside its siblings.',
    ],
  },
  relative: {
    description:
      'In normal flow, but the rendered box can be visually offset from its original spot. The reserved space stays where it was.',
    css: `.box {
  position: relative;
  top: 12px;
  left: 24px;
}`,
    steps: [
      'The box still occupies its original slot — siblings do not shift.',
      'Offsets visually move the rendered box from that slot.',
      'The element becomes a containing block for absolutely-positioned descendants.',
    ],
  },
  absolute: {
    description:
      'Removed from normal flow. Positioned relative to the nearest ancestor whose `position` is not `static` (or the viewport, if none exists).',
    css: `.parent {
  position: relative; /* the containing block */
}
.box {
  position: absolute;
  top: 10px;
  right: 10px;
}`,
    steps: [
      'The box is taken out of flow — siblings collapse together as if it were missing.',
      'Offsets are measured from the nearest positioned ancestor.',
      'If no positioned ancestor exists, the box anchors to the initial containing block (≈ viewport).',
      '`fixed` works the same way, but it always anchors to the viewport and ignores scrolling.',
    ],
  },
  sticky: {
    description:
      'Behaves like `relative` until the page scrolls past a threshold; then it sticks like `fixed`, but only within its containing block.',
    css: `.box {
  position: sticky;
  top: 0; /* sticks once the box reaches the top */
}`,
    steps: [
      'Needs a scrollable ancestor in order to stick.',
      'Stays in normal flow until the viewport reaches the threshold (`top: 0` here).',
      'Then sticks to that edge until its containing block scrolls away.',
      'Common gotcha: an ancestor with `overflow: hidden` (or no scrolling) silently breaks sticky.',
    ],
  },
}

export default function PositionCard() {
  const [tab, setTab] = useState<PosKey>('static')
  const m = METHODS[tab]

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">CSS <code>position</code> values</div>
          <p className="card-desc">
            <code>static</code> → <code>relative</code> → <code>absolute</code> →{' '}
            <code>fixed</code> → <code>sticky</code>. Switch tabs to see how each one places the
            green box (B) inside the parent.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>📌</span>
      </div>

      <div className="controls css-center-controls" role="tablist" aria-label="Position value">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`secondary css-center-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="card-desc css-center-method-desc">{m.description}</p>

      <div className="css-pos-stage">
        {tab === 'static' && (
          <div className="css-pos-flow">
            <div className="css-pos-sib">A</div>
            <div className="css-pos-target css-pos-target--static">B</div>
            <div className="css-pos-sib">C</div>
          </div>
        )}
        {tab === 'relative' && (
          <div className="css-pos-flow">
            <div className="css-pos-sib">A</div>
            <div className="css-pos-target css-pos-target--relative">B (shifted)</div>
            <div className="css-pos-sib">C</div>
          </div>
        )}
        {tab === 'absolute' && (
          <div className="css-pos-flow css-pos-flow--abs">
            <div className="css-pos-sib">A</div>
            <div className="css-pos-sib">C (B is out of flow)</div>
            <div className="css-pos-target css-pos-target--absolute">B</div>
          </div>
        )}
        {tab === 'sticky' && (
          <div className="css-pos-scroll">
            <div className="css-pos-sib">A — scroll inside this box ↕</div>
            <div className="css-pos-target css-pos-target--sticky">B (sticks at top)</div>
            <div className="css-pos-sib">C</div>
            <div className="css-pos-sib">D</div>
            <div className="css-pos-sib">E</div>
            <div className="css-pos-sib">F</div>
            <div className="css-pos-sib">G</div>
          </div>
        )}
      </div>

      <CodeBlock code={m.css} language="css" />

      <CollapsibleCode label="how it works" code={m.css} language="css">
        <Explanation steps={m.steps.map(text => ({ text: <>{text}</> }))} />
      </CollapsibleCode>
    </div>
  )
}
