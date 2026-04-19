import { useState } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

type Mode = 'content-box' | 'border-box'

const WIDTH = 200
const PADDING = 20
const BORDER = 8

const CONTENT_BOX_CSS = `.box {
  box-sizing: content-box; /* default */
  width: 200px;
  padding: 20px;
  border: 8px solid;
  /* outer width = 200 + 20*2 + 8*2 = 256px */
}`

const BORDER_BOX_CSS = `.box {
  box-sizing: border-box;
  width: 200px;            /* outer width is exactly 200px */
  padding: 20px;
  border: 8px solid;
  /* content area = 200 - 20*2 - 8*2 = 144px */
}`

export default function BoxModelCard() {
  const [mode, setMode] = useState<Mode>('content-box')
  const isContent = mode === 'content-box'
  const outer = isContent ? WIDTH + PADDING * 2 + BORDER * 2 : WIDTH
  const content = isContent ? WIDTH : WIDTH - PADDING * 2 - BORDER * 2

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">
            Box model: <code>content-box</code> vs <code>border-box</code>
          </div>
          <p className="card-desc">
            Both boxes declare <code>width: 200px</code>, <code>padding: 20px</code>, and{' '}
            <code>border: 8px solid</code>. Only the rendered size differs.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>▢</span>
      </div>

      <div className="controls css-center-controls" role="tablist" aria-label="Box sizing">
        <button
          type="button"
          role="tab"
          aria-selected={isContent}
          className={`secondary css-center-tab${isContent ? ' active' : ''}`}
          onClick={() => setMode('content-box')}
        >
          content-box (default)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isContent}
          className={`secondary css-center-tab${!isContent ? ' active' : ''}`}
          onClick={() => setMode('border-box')}
        >
          border-box
        </button>
      </div>

      <div className="css-box-stage">
        <div className={`css-box-target css-box-target--${mode}`}>
          <span className="css-box-content-label">content {content}px</span>
        </div>
        <div className="css-box-readout">
          rendered outer width: <strong>{outer}px</strong>
          <br />
          content area: <strong>{content}px</strong>
        </div>
      </div>

      <CodeBlock code={isContent ? CONTENT_BOX_CSS : BORDER_BOX_CSS} language="css" />

      <CollapsibleCode
        label="how it works"
        code={isContent ? CONTENT_BOX_CSS : BORDER_BOX_CSS}
        language="css"
      >
        <Explanation
          steps={[
            {
              text: (
                <>
                  <code>content-box</code> — the default. <code>width</code> sets only the
                  content area; padding and border are <em>added</em> on top, growing the box.
                </>
              ),
            },
            {
              text: (
                <>
                  <code>border-box</code> — <code>width</code> is the outer size. Padding and
                  border <em>eat into</em> the content area instead of enlarging the box.
                </>
              ),
            },
            {
              text: (
                <>
                  A common project reset is{' '}
                  <code>{'*, *::before, *::after { box-sizing: border-box; }'}</code> so widths
                  add up predictably across components.
                </>
              ),
            },
            {
              text: (
                <>
                  Margin lives outside both models — it never affects the rendered width of the
                  element itself.
                </>
              ),
            },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
