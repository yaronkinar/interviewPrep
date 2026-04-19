import { useState } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type DisplayKey = 'block' | 'inline' | 'inline-block' | 'none'
type HideKey = 'none' | 'visibility' | 'opacity' | 'sr-only'

const DISPLAY_TABS: { id: DisplayKey; label: string }[] = [
  { id: 'block', label: 'block' },
  { id: 'inline', label: 'inline' },
  { id: 'inline-block', label: 'inline-block' },
  { id: 'none', label: 'none' },
]

const DISPLAY_NOTES: Record<DisplayKey, { description: string; steps: string[] }> = {
  block: {
    description:
      'Takes the full available width, starts on a new line. Respects width / height / vertical margin / vertical padding.',
    steps: [
      '`<div>`, `<p>`, `<section>` are block by default.',
      'Stacks vertically; ignores width/height set on inline elements.',
      'Vertical margins between block siblings can collapse (see the margin-collapsing card).',
    ],
  },
  inline: {
    description:
      'Flows inline with text. width/height/top/bottom margins/padding are ignored — only horizontal margin/padding affects layout.',
    steps: [
      '`<span>`, `<a>`, `<em>` are inline by default.',
      'Cannot be sized — `width`/`height`/vertical margin do nothing.',
      'Wraps to the next line just like text.',
    ],
  },
  'inline-block': {
    description:
      'Flows inline with text but accepts width/height/all margins/padding — the best of both worlds.',
    steps: [
      'Sits on the same baseline as text.',
      'Accepts width/height/vertical margin/padding.',
      'Common gotcha: whitespace between sibling inline-blocks renders as a real space character.',
    ],
  },
  none: {
    description:
      'Element is removed from the layout AND the accessibility tree — as if it were never in the markup.',
    steps: [
      'Takes up no space; siblings collapse into the gap.',
      'Removed from the accessibility tree, so screen readers ignore it.',
      'Use with care — for purely visual hiding, see the techniques below.',
    ],
  },
}

const HIDE_TABS: { id: HideKey; label: string }[] = [
  { id: 'none', label: 'display: none' },
  { id: 'visibility', label: 'visibility: hidden' },
  { id: 'opacity', label: 'opacity: 0' },
  { id: 'sr-only', label: 'visually-hidden (sr-only)' },
]

type HideInfo = {
  description: string
  takesSpace: boolean
  inA11y: boolean
  clickable: boolean
}

const HIDE_NOTES: Record<HideKey, HideInfo> = {
  none: {
    description: 'Removed from layout AND accessibility tree.',
    takesSpace: false,
    inA11y: false,
    clickable: false,
  },
  visibility: {
    description: 'Reserves space; removed from accessibility tree; not clickable.',
    takesSpace: true,
    inA11y: false,
    clickable: false,
  },
  opacity: {
    description: 'Fully transparent but still rendered — still focusable, still a click target!',
    takesSpace: true,
    inA11y: true,
    clickable: true,
  },
  'sr-only': {
    description:
      'Invisible visually but read aloud by screen readers. The standard accessible-hide pattern.',
    takesSpace: false,
    inA11y: true,
    clickable: false,
  },
}

const SR_ONLY_CSS = `.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}`

export default function DisplayCard() {
  const [display, setDisplay] = useState<DisplayKey>('block')
  const [hide, setHide] = useState<HideKey>('none')
  const note = DISPLAY_NOTES[display]
  const hideInfo = HIDE_NOTES[hide]

  const displayCss = `.middle {
  display: ${display};
}`

  const hideCss =
    hide === 'sr-only'
      ? SR_ONLY_CSS
      : hide === 'none'
      ? `.target { display: none; }`
      : hide === 'visibility'
      ? `.target { visibility: hidden; }`
      : `.target { opacity: 0; }`

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Display values & how to hide an element</div>
          <p className="card-desc">
            Two of the most asked questions: <em>"What's the difference between block, inline,
            and inline-block?"</em> and <em>"What's the difference between
            <code> display: none</code>, <code>visibility: hidden</code>, and
            <code> opacity: 0</code>?"</em>
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>📐</span>
      </div>

      {/* --- display values ------------------------------------------------ */}
      <h4 className="css-section-title">1. Display values on the middle box</h4>

      <div className="controls css-center-controls" role="tablist" aria-label="Display value">
        {DISPLAY_TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={display === t.id}
            className={`secondary css-center-tab${display === t.id ? ' active' : ''}`}
            onClick={() => setDisplay(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="card-desc css-center-method-desc">{note.description}</p>

      <div className="css-display-stage">
        <span className="css-display-prose">
          some text — <span className="css-display-sib">A</span>
          <span className={`css-display-target css-display-target--${display}`}>
            middle (set width: 80px, height: 36px)
          </span>
          <span className="css-display-sib">C</span> — more text
        </span>
      </div>

      <CodeBlock code={displayCss} language="css" />

      {/* --- hiding techniques --------------------------------------------- */}
      <h4 className="css-section-title">2. Four ways to hide</h4>

      <div className="controls css-center-controls" role="tablist" aria-label="Hide technique">
        {HIDE_TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={hide === t.id}
            className={`secondary css-center-tab${hide === t.id ? ' active' : ''}`}
            onClick={() => setHide(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="card-desc css-center-method-desc">{hideInfo.description}</p>

      <div className="css-hide-stage">
        <button type="button" className="css-hide-sib">visible button (before)</button>
        <button
          type="button"
          className={`css-hide-target css-hide-target--${hide}`}
          onClick={() => alert('You clicked the hidden button!')}
        >
          target — try clicking
        </button>
        <button type="button" className="css-hide-sib">visible button (after)</button>
      </div>

      <table className="css-hide-table">
        <thead>
          <tr>
            <th>technique</th>
            <th>takes layout space?</th>
            <th>read by screen readers?</th>
            <th>focusable / clickable?</th>
          </tr>
        </thead>
        <tbody>
          {HIDE_TABS.map(t => {
            const info = HIDE_NOTES[t.id]
            const active = t.id === hide
            return (
              <tr key={t.id} className={active ? 'css-spec-row css-spec-row--winner' : 'css-spec-row'}>
                <td><code>{t.label}</code></td>
                <td>{info.takesSpace ? 'yes' : 'no'}</td>
                <td>{info.inA11y ? 'yes' : 'no'}</td>
                <td>{info.clickable ? 'yes ⚠️' : 'no'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <CodeBlock code={hideCss} language="css" />

      <CollapsibleCode label="how it works" code={displayCss} language="css">
        <Explanation
          steps={[
            ...note.steps.map(s => ({ text: <>{s}</> })),
            {
              text: (
                <>
                  Hiding gotcha: <code>opacity: 0</code> still receives clicks and keyboard focus —
                  use <code>visibility: hidden</code> or <code>display: none</code> if that's not
                  what you want.
                </>
              ),
            },
            {
              text: (
                <>
                  For accessible "screen-reader-only" labels, prefer the <code>.sr-only</code>{' '}
                  pattern (see the second snippet).
                </>
              ),
            },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
