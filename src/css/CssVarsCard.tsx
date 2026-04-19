import { useState, type CSSProperties } from 'react'
import { CodeBlock, CollapsibleCode, Explanation } from '../components/CodeBlock'

export default function CssVarsCard() {
  const [hue, setHue] = useState(220)
  const [radius, setRadius] = useState(8)

  const accent = `hsl(${hue} 70% 55%)`
  const wrapperStyle: CSSProperties = {
    // CSS custom properties — TS doesn't know about them on CSSProperties.
    ['--demo-accent' as 'color']: accent,
    ['--demo-radius' as 'borderRadius']: `${radius}px`,
  } as CSSProperties

  const cssSnippet = `:root {
  --accent: hsl(220 70% 55%);
  --radius: 8px;
}

.btn {
  background: var(--accent);
  color: white;
  border-radius: var(--radius);
  /* fallback if --accent ever goes missing */
  border: 1px solid var(--accent, hotpink);
}

/* Override on a subtree — children inherit the new value */
.danger {
  --accent: hsl(0 80% 55%);
}`

  const jsSnippet = `// Read at runtime
const v = getComputedStyle(el).getPropertyValue('--accent').trim();

// Write from JS — propagates to every var(--accent) in the subtree
el.style.setProperty('--accent', 'hsl(280 80% 55%)');`

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">CSS custom properties (variables)</div>
          <p className="card-desc">
            Custom properties cascade and inherit like normal properties. Move the sliders to
            update <code>--demo-accent</code> and <code>--demo-radius</code> on a wrapper — every
            descendant that reads them via <code>var(...)</code> updates instantly.
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>𝒙</span>
      </div>

      <div className="css-vars-controls">
        <label className="css-vars-control">
          <span><code>--demo-accent</code> hue: {hue}°</span>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={e => setHue(+e.target.value)}
            aria-label="accent hue"
          />
        </label>
        <label className="css-vars-control">
          <span><code>--demo-radius</code>: {radius}px</span>
          <input
            type="range"
            min={0}
            max={32}
            value={radius}
            onChange={e => setRadius(+e.target.value)}
            aria-label="border radius"
          />
        </label>
      </div>

      <div className="css-vars-stage" style={wrapperStyle}>
        <button type="button" className="css-vars-btn">primary action</button>
        <button type="button" className="css-vars-btn css-vars-btn--ghost">ghost variant</button>
        <span className="css-vars-chip">badge inherits the same hue</span>
        <div className="css-vars-fallback">
          <code>color: var(--missing, hotpink)</code> — fallback wins when the variable is unset
        </div>
      </div>

      <CodeBlock code={cssSnippet} language="css" />

      <details className="css-vars-js-block">
        <summary>Read &amp; write from JavaScript</summary>
        <CodeBlock code={jsSnippet} language="javascript" />
      </details>

      <CollapsibleCode label="how it works" code={cssSnippet} language="css">
        <Explanation
          steps={[
            { text: <>Custom properties start with <code>--</code> and live on any element. They cascade and inherit just like <code>color</code>.</> },
            { text: <>Read them with <code>var(--name)</code>. Provide a fallback as the second argument: <code>var(--name, fallback)</code>.</> },
            { text: <>Setting a variable on a parent (e.g. <code>.danger {`{ --accent: red }`}</code>) re-styles every descendant that reads it — perfect for theming and component variants.</> },
            { text: <>From JavaScript: read with <code>getComputedStyle(el).getPropertyValue('--name')</code>; write with <code>el.style.setProperty('--name', value)</code>.</> },
            { text: <>Unlike Sass variables (compile-time), CSS custom properties are <em>live</em> at runtime — they react to media queries, <code>:hover</code>, and JS updates.</> },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}
