import { useState } from 'react'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

type Rule = {
  id: string
  selector: string
  color: string
  important?: boolean
  /** Specificity tuple [inline, ids, classes/attrs/pseudo-classes, types/pseudo-elements]. */
  spec: [number, number, number, number]
}

const RULES: Rule[] = [
  { id: 'p', selector: 'p', color: '#94a3b8', spec: [0, 0, 0, 1] },
  { id: 'class', selector: '.text', color: '#5b9dff', spec: [0, 0, 1, 0] },
  { id: 'twoClass', selector: '.text.title', color: '#a78bfa', spec: [0, 0, 2, 0] },
  { id: 'id', selector: '#hello', color: '#34d399', spec: [0, 1, 0, 0] },
  { id: 'inline', selector: 'style="color: …"', color: '#fbbf24', spec: [1, 0, 0, 0] },
  {
    id: 'imp',
    selector: '.text { color: red !important }',
    color: '#f87171',
    important: true,
    spec: [0, 0, 1, 0],
  },
]

function score(rule: Rule): number {
  if (rule.important) return Number.MAX_SAFE_INTEGER
  const [a, b, c, d] = rule.spec
  return a * 1_000_000 + b * 10_000 + c * 100 + d
}

export default function SpecificityCard() {
  const [active, setActive] = useState<Record<string, boolean>>({ p: true, class: true })

  const winner = RULES
    .filter(r => active[r.id])
    .sort((a, b) => score(b) - score(a))[0]

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Specificity: which rule wins?</div>
          <p className="card-desc">
            Toggle the rules and watch the heading colour change. Specificity is a four-part score{' '}
            <code>(inline, id, class, type)</code> — and <code>!important</code> still beats them all.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>⚖</span>
      </div>

      <div
        className="css-spec-target"
        style={winner ? { color: winner.color } : undefined}
      >
        &lt;p id="hello" class="text title"&gt;Hello, specificity!&lt;/p&gt;
      </div>

      <table className="css-spec-table">
        <thead>
          <tr>
            <th>active</th>
            <th>selector</th>
            <th>specificity</th>
            <th>color</th>
          </tr>
        </thead>
        <tbody>
          {RULES.map(r => {
            const isWinner = winner?.id === r.id
            return (
              <tr key={r.id} className={isWinner ? 'css-spec-row css-spec-row--winner' : 'css-spec-row'}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`toggle ${r.selector}`}
                    checked={!!active[r.id]}
                    onChange={e =>
                      setActive(prev => ({ ...prev, [r.id]: e.target.checked }))
                    }
                  />
                </td>
                <td><code>{r.selector}</code></td>
                <td>
                  <code>{r.important ? '!important' : `(${r.spec.join(',')})`}</code>
                </td>
                <td>
                  <span
                    className="css-spec-swatch"
                    style={{ background: r.color }}
                    aria-hidden
                  />
                  <code>{r.color}</code>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <CollapsibleCode
        label="how it works"
        language="css"
        code={`/* Specificity is compared field by field, left to right:
   1. inline style="…" attributes
   2. number of #ids
   3. number of .classes, [attrs], :pseudo-classes
   4. number of element selectors and ::pseudo-elements

   any !important wins over normal rules of the same origin */`}
      >
        <Explanation
          steps={[
            { text: <>Browsers compute a 4-tuple per selector and compare from left to right.</> },
            {
              text: (
                <>
                  A higher field beats <em>any</em> sum of lower ones —{' '}
                  <code>(0,1,0,0)</code> beats <code>(0,0,99,0)</code>.
                </>
              ),
            },
            {
              text: (
                <>
                  Inline <code>style="…"</code> attributes outrank stylesheet rules.
                </>
              ),
            },
            {
              text: (
                <>
                  <code>!important</code> jumps to a higher cascade layer; only another{' '}
                  <code>!important</code> with greater specificity can override it.
                </>
              ),
            },
            { text: <>If two rules tie, the one declared <em>later</em> in the cascade wins.</> },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
