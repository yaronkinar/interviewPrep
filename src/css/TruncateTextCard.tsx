import { useState, type CSSProperties } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type Mode = 'single' | 'multi'

const SAMPLE =
  'CSS truncation interview answer: when content is longer than the available space, you can clip it and append an ellipsis instead of letting it wrap or overflow. The single-line trick relies on three properties working together; the multi-line variant uses the WebKit line-clamp pattern that has shipped in every modern browser for years.'

const SINGLE_CSS = `.cell {
  white-space: nowrap;     /* keep text on one line */
  overflow: hidden;        /* hide what doesn't fit */
  text-overflow: ellipsis; /* draw the … */
  max-width: 240px;        /* needs a constrained width */
}`

function multiCss(lines: number) {
  return `.cell {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${lines};   /* number of lines to keep */
  line-clamp: ${lines};           /* the unprefixed standard */
  overflow: hidden;
}`
}

export default function TruncateTextCard() {
  const [mode, setMode] = useState<Mode>('single')
  const [lines, setLines] = useState(3)

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">Truncate text with an ellipsis</div>
          <p className="card-desc">
            Two reliable recipes: a single-line <code>text-overflow: ellipsis</code> and a
            multi-line <code>-webkit-line-clamp</code>.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>…</span>
      </div>

      <div className="controls css-center-controls" role="tablist" aria-label="Truncation mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'single'}
          className={`secondary css-center-tab${mode === 'single' ? ' active' : ''}`}
          onClick={() => setMode('single')}
        >
          single line
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'multi'}
          className={`secondary css-center-tab${mode === 'multi' ? ' active' : ''}`}
          onClick={() => setMode('multi')}
        >
          multi-line clamp
        </button>
      </div>

      {mode === 'multi' && (
        <div className="params">
          <span><span className="v">-webkit-line-clamp</span> =</span>
          <input
            type="number"
            value={lines}
            min={1}
            max={6}
            step={1}
            onChange={e => setLines(Math.max(1, Math.min(6, +e.target.value || 1)))}
          />
          <span>lines</span>
        </div>
      )}

      <div className="css-truncate-stage">
        {mode === 'single' ? (
          <p className="css-truncate-target css-truncate-target--single">{SAMPLE}</p>
        ) : (
          <p
            className="css-truncate-target css-truncate-target--multi"
            style={{ '--clamp': lines } as CSSProperties}
          >
            {SAMPLE}
          </p>
        )}
      </div>

      <CodeBlock code={mode === 'single' ? SINGLE_CSS : multiCss(lines)} language="css" />

      <CollapsibleCode
        label="how it works"
        code={mode === 'single' ? SINGLE_CSS : multiCss(lines)}
        language="css"
      >
        <Explanation
          steps={
            mode === 'single'
              ? [
                  { text: <><code>white-space: nowrap</code> stops the line from wrapping.</> },
                  { text: <><code>overflow: hidden</code> clips anything past the box.</> },
                  { text: <><code>text-overflow: ellipsis</code> draws the <code>…</code> at the clip edge.</> },
                  { text: <>A constrained width is required — otherwise nothing overflows and there is nothing to ellipsize.</> },
                ]
              : [
                  { text: <><code>display: -webkit-box</code> + <code>-webkit-box-orient: vertical</code> opt into the legacy WebKit flexbox model.</> },
                  { text: <><code>-webkit-line-clamp: N</code> keeps N lines and ellipsizes the rest.</> },
                  { text: <><code>overflow: hidden</code> hides the trimmed lines.</> },
                  { text: <>Modern browsers also accept the unprefixed <code>line-clamp</code> property; ship both for compatibility.</> },
                ]
          }
        />
      </CollapsibleCode>
    </div>
  )
}
