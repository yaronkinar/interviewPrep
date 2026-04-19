import { useState, type CSSProperties } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type Trigger = 'none' | 'opacity' | 'transform' | 'isolation'

const TRIGGERS: { id: Trigger; label: string; css: string }[] = [
  { id: 'none', label: 'no trigger', css: '/* nothing — parent is not a stacking context */' },
  { id: 'opacity', label: 'opacity: 0.99', css: 'opacity: 0.99;' },
  { id: 'transform', label: 'transform: translateZ(0)', css: 'transform: translateZ(0);' },
  { id: 'isolation', label: 'isolation: isolate', css: 'isolation: isolate;' },
]

function parentStyle(t: Trigger): CSSProperties {
  switch (t) {
    case 'opacity':
      return { opacity: 0.99 }
    case 'transform':
      return { transform: 'translateZ(0)' }
    case 'isolation':
      return { isolation: 'isolate' }
    default:
      return {}
  }
}

export default function StackingContextCard() {
  const [trigger, setTrigger] = useState<Trigger>('none')
  const trapped = trigger !== 'none'
  const cssSnippet = `.sibling {
  position: absolute;
  z-index: 5;          /* a banner that sits above page content */
}

.parent {
  position: relative;
  ${TRIGGERS.find(t => t.id === trigger)?.css}
}

.child {
  position: absolute;
  z-index: 9999;       /* "I should be on top!" */
}`

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Stacking context: the <code>z-index: 9999</code> trap</div>
          <p className="card-desc">
            <code>z-index</code> is only compared <em>inside the same stacking context</em>. The
            child below tries to climb above the orange banner, but as soon as the parent becomes
            its own stacking context, the child is sealed inside.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>🪟</span>
      </div>

      <div className="controls css-center-controls" role="tablist" aria-label="Stacking trigger">
        {TRIGGERS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={trigger === t.id}
            className={`secondary css-center-tab${trigger === t.id ? ' active' : ''}`}
            onClick={() => setTrigger(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="css-stack-stage">
        <div className="css-stack-sibling">
          orange banner — <code>z-index: 5</code>
        </div>
        <div className="css-stack-parent" style={parentStyle(trigger)}>
          <div className="css-stack-parent-label">.parent</div>
          <div className="css-stack-child">
            child — <code>z-index: 9999</code>
          </div>
        </div>
        <p className="css-stack-readout">
          {trapped
            ? 'Parent is now a stacking context — the child is trapped underneath the banner.'
            : 'Parent is NOT a stacking context — the child can rise above the banner.'}
        </p>
      </div>

      <CodeBlock code={cssSnippet} language="css" />

      <CollapsibleCode label="how it works" code={cssSnippet} language="css">
        <Explanation
          steps={[
            { text: <>Stacking contexts are little "z-index universes" — children are only compared with each other, not with the outside world.</> },
            { text: <>The root <code>&lt;html&gt;</code> element is always one. Many properties create new ones: <code>position</code> + <code>z-index</code>, <code>opacity &lt; 1</code>, <code>transform</code>, <code>filter</code>, <code>will-change</code>, <code>isolation: isolate</code>, <code>position: fixed/sticky</code>, and modern flex/grid items with <code>z-index</code>.</> },
            { text: <>Once the parent is a context, no descendant — even one with <code>z-index: 9999</code> — can render above siblings of the parent.</> },
            { text: <><code>isolation: isolate</code> exists specifically for this: it creates a stacking context with no other side effects, perfect for protecting subtrees.</> },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
