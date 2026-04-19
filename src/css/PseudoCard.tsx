import { useState } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type Demo = 'hover' | 'nth' | 'before' | 'after'

const TABS: { id: Demo; label: string; kind: string }[] = [
  { id: 'hover', label: ':hover', kind: 'pseudo-class (state)' },
  { id: 'nth', label: ':nth-child(odd)', kind: 'pseudo-class (structural)' },
  { id: 'before', label: '::before', kind: 'pseudo-element (generated content)' },
  { id: 'after', label: '::after', kind: 'pseudo-element (clearfix)' },
]

const SNIPPETS: Record<Demo, string> = {
  hover: `.btn {
  background: #5b9dff;
  color: white;
  transition: background 150ms;
}
.btn:hover {            /* state-based */
  background: #2170e4;
}`,
  nth: `li:nth-child(odd) {  /* structural */
  background: #f1f5f9;
}
li:nth-child(even) {
  background: white;
}`,
  before: `.badge {
  position: relative;
  padding-left: 22px;
}
.badge::before {        /* generated content */
  content: "✓";
  position: absolute;
  left: 0;
  color: #34d399;
  font-weight: 700;
}`,
  after: `.row::after {
  content: "";          /* required for ::before / ::after */
  display: block;
  clear: both;
}`,
}

const STEPS: Record<Demo, React.ReactNode[]> = {
  hover: [
    <>Pseudo-classes use <em>one</em> colon (<code>:hover</code>, <code>:focus</code>, <code>:checked</code>, <code>:disabled</code>).</>,
    <>They describe a <em>state</em> of an element that already exists in the DOM.</>,
    <>No extra DOM is generated — the same <code>&lt;button&gt;</code> just gets restyled when the state matches.</>,
  ],
  nth: [
    <>Structural pseudo-classes match by position: <code>:nth-child(n)</code>, <code>:first-child</code>, <code>:last-of-type</code>, <code>:not(...)</code>.</>,
    <>Counting starts at 1 and is relative to the parent — not to the matched selector.</>,
    <><code>:nth-child(odd)</code> and <code>:nth-child(even)</code> are the most common alternating-row pattern.</>,
  ],
  before: [
    <>Pseudo-elements use <em>two</em> colons (<code>::before</code>, <code>::after</code>, <code>::placeholder</code>, <code>::selection</code>, <code>::first-letter</code>).</>,
    <><code>::before</code> and <code>::after</code> insert a <em>generated</em> child at the start / end of the element.</>,
    <>The <code>content</code> property is required — without it the pseudo-element doesn't render.</>,
    <>Generated content is invisible to most screen readers — never put critical text in it.</>,
  ],
  after: [
    <>Classic clearfix: <code>::after</code> creates an empty block child that clears the floats above it.</>,
    <>Older codebases needed this constantly; modern flex/grid layouts replace it almost entirely.</>,
    <>Still useful as a defensive shim when integrating with legacy float-based components.</>,
  ],
}

export default function PseudoCard() {
  const [tab, setTab] = useState<Demo>('hover')
  const t = TABS.find(x => x.id === tab) ?? TABS[0]

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Pseudo-class vs pseudo-element</div>
          <p className="card-desc">
            One colon (<code>:</code>) selects elements in a particular <em>state</em>. Two colons
            (<code>::</code>) generate or address pieces of an element that aren't in the DOM.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>:</span>
      </div>

      <div className="controls css-center-controls" role="tablist" aria-label="Selector type">
        {TABS.map(x => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            className={`secondary css-center-tab${tab === x.id ? ' active' : ''}`}
            onClick={() => setTab(x.id)}
          >
            {x.label}
          </button>
        ))}
      </div>

      <p className="card-desc css-center-method-desc">
        <strong>{t.label}</strong> — <em>{t.kind}</em>
      </p>

      <div className="css-pseudo-stage">
        {tab === 'hover' && (
          <button type="button" className="css-pseudo-btn">hover me</button>
        )}
        {tab === 'nth' && (
          <ol className="css-pseudo-list">
            <li>row 1</li>
            <li>row 2</li>
            <li>row 3</li>
            <li>row 4</li>
            <li>row 5</li>
          </ol>
        )}
        {tab === 'before' && (
          <div className="css-pseudo-badges">
            <span className="css-pseudo-badge">Saved</span>
            <span className="css-pseudo-badge">Approved</span>
            <span className="css-pseudo-badge">Shipped</span>
          </div>
        )}
        {tab === 'after' && (
          <div className="css-pseudo-clearfix">
            <div className="css-pseudo-floated">float L</div>
            <div className="css-pseudo-floated css-pseudo-floated--right">float R</div>
            <div className="css-pseudo-after-note">
              parent uses <code>::after</code> + <code>clear: both</code> so it wraps both floats.
            </div>
          </div>
        )}
      </div>

      <CodeBlock code={SNIPPETS[tab]} language="css" />

      <CollapsibleCode label="how it works" code={SNIPPETS[tab]} language="css">
        <Explanation steps={STEPS[tab].map(text => ({ text }))} />
      </CollapsibleCode>
    </div>
  )
}
