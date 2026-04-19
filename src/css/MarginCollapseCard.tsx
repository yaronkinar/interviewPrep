import { useState } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type Toggle = 'border' | 'padding' | 'overflow' | 'inlineBlock'

const TOGGLE_LABELS: Record<Toggle, string> = {
  border: 'parent { border: 1px solid }',
  padding: 'parent { padding: 1px }',
  overflow: 'parent { overflow: hidden }',
  inlineBlock: 'children { display: inline-block }',
}

const TOGGLE_NOTES: Record<Toggle, string> = {
  border:
    'A border (or any non-zero border) on the parent stops its margin from collapsing through it.',
  padding:
    'Even 1px of padding on the parent breaks the path that lets margins collapse through.',
  overflow:
    'Any value other than `visible` (e.g. `hidden`, `auto`, `scroll`) creates a Block Formatting Context, which also blocks collapsing.',
  inlineBlock:
    'Only block-level boxes participate in margin collapsing — inline-block (and flex/grid items) never collapse.',
}

const A_MARGIN = 20
const B_MARGIN = 30

export default function MarginCollapseCard() {
  const [toggles, setToggles] = useState<Record<Toggle, boolean>>({
    border: false,
    padding: false,
    overflow: false,
    inlineBlock: false,
  })

  const broken = Object.values(toggles).some(Boolean)
  const renderedGap = broken ? A_MARGIN + B_MARGIN : Math.max(A_MARGIN, B_MARGIN)

  const childClass = toggles.inlineBlock
    ? 'css-mc-child css-mc-child--inline'
    : 'css-mc-child'
  const parentClass = `css-mc-parent${toggles.border ? ' css-mc-parent--border' : ''}${
    toggles.padding ? ' css-mc-parent--padding' : ''
  }${toggles.overflow ? ' css-mc-parent--overflow' : ''}`

  function toggle(key: Toggle) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const cssSnippet = `.parent {
  ${toggles.border ? 'border: 1px solid;' : '/* no border */'}
  ${toggles.padding ? 'padding: 1px;' : '/* no padding */'}
  ${toggles.overflow ? 'overflow: hidden; /* creates a BFC */' : '/* overflow: visible */'}
}

.a { margin-bottom: 20px; ${toggles.inlineBlock ? 'display: inline-block;' : ''} }
.b { margin-top:    30px; ${toggles.inlineBlock ? 'display: inline-block;' : ''} }

/* rendered gap = ${renderedGap}px ` +
    (broken
      ? `(20 + 30 — collapsing broken) */`
      : `(max(20, 30) — collapsed) */`)

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Vertical margin collapsing</div>
          <p className="card-desc">
            Two block siblings: A has <code>margin-bottom: 20px</code>, B has{' '}
            <code>margin-top: 30px</code>. By default the gap is{' '}
            <strong>30px</strong> (the larger one wins, not the sum). Toggle the parent or
            children below to see what <em>breaks</em> the collapse.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>↕</span>
      </div>

      <div className="css-mc-toggles">
        {(Object.keys(TOGGLE_LABELS) as Toggle[]).map(key => (
          <label key={key} className="css-mc-toggle">
            <input
              type="checkbox"
              checked={toggles[key]}
              onChange={() => toggle(key)}
            />
            <code>{TOGGLE_LABELS[key]}</code>
          </label>
        ))}
      </div>

      <div className="css-mc-stage">
        <div className={parentClass}>
          <div className={`${childClass} css-mc-child--a`}>A — margin-bottom: 20px</div>
          <div className={`${childClass} css-mc-child--b`}>B — margin-top: 30px</div>
        </div>
        <div className="css-mc-readout">
          rendered gap: <strong>{renderedGap}px</strong>{' '}
          {broken ? '(20 + 30 — collapsing broken)' : '(max(20, 30) — collapsed)'}
          {Object.entries(toggles)
            .filter(([, v]) => v)
            .map(([k]) => (
              <div key={k} className="css-mc-readout-note">
                ↳ {TOGGLE_NOTES[k as Toggle]}
              </div>
            ))}
        </div>
      </div>

      <CodeBlock code={cssSnippet} language="css" />

      <CollapsibleCode label="how it works" code={cssSnippet} language="css">
        <Explanation
          steps={[
            { text: <>Vertical margins on adjacent block siblings <em>collapse</em>: only the larger of the two takes effect.</> },
            { text: <>Margin between an empty parent and its first/last child also collapses outward unless something blocks the path.</> },
            { text: <>Anything that creates a new <strong>Block Formatting Context</strong> (BFC) on the parent stops the collapse: <code>overflow</code> ≠ <code>visible</code>, <code>display: flow-root</code>, padding, border, <code>position: absolute</code>, floats, flex/grid containers, and so on.</> },
            { text: <>Horizontal margins <em>never</em> collapse; neither do margins on inline-block, flex items, or grid items.</> },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
