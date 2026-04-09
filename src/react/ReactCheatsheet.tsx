import {
  AlertTriangle,
  Braces,
  FileCode,
  FormInput,
  Layers,
  Zap,
} from 'lucide-react'

const iconProps = { size: 16, strokeWidth: 2, className: 'react-cheatsheet-svg' } as const

export default function ReactCheatsheet() {
  return (
    <div className="card react-cheatsheet-card">
      <header className="react-cheatsheet-header">
        <div className="card-title">React cheatsheet</div>
        <p className="card-desc react-cheatsheet-lead">
          Quick reference for JSX, hooks, and common interview topics. Pairs with the interactive demos below.
        </p>
      </header>

      <div className="react-cheatsheet-columns">
        <section className="react-cheatsheet-section" aria-labelledby="cs-jsx">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Braces {...iconProps} />
            </span>
            <h3 id="cs-jsx">Components &amp; JSX</h3>
          </div>
          <ul>
            <li>
              <strong>Props</strong> are read-only; destructure in the signature:{' '}
              <code>function Card(&#123; title &#125;: Props)</code>.
            </li>
            <li>
              <strong>Conditional UI:</strong> <code>&#123;cond &amp;&amp; &lt;A /&gt;&#125;</code>,{' '}
              <code>&#123;cond ? &lt;A /&gt; : &lt;B /&gt;&#125;</code>.
            </li>
            <li>
              <strong>Lists:</strong> stable <code>key</code> (id, not index when items reorder or insert).
            </li>
            <li>
              <strong>Children:</strong> <code>React.ReactNode</code> — slot content between tags.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="cs-hooks">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Layers {...iconProps} />
            </span>
            <h3 id="cs-hooks">Hooks (when to use)</h3>
          </div>
          <ul>
            <li>
              <code>useState</code> — local UI state.
            </li>
            <li>
              <code>useReducer</code> — related state with explicit transitions.
            </li>
            <li>
              <code>useEffect</code> — sync with <em>external</em> systems (fetch, subscriptions, non-React APIs). Include all
              reactive values you read in deps; cleanup to unsubscribe / cancel.
            </li>
            <li>
              <code>useLayoutEffect</code> — DOM measure/layout before paint (rare).
            </li>
            <li>
              <code>useMemo</code> — expensive pure computations.
            </li>
            <li>
              <code>useCallback</code> — stable function refs for memoized children or effect deps.
            </li>
            <li>
              <code>useRef</code> — mutable value, DOM nodes, timers, latest value without re-render.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="cs-forms">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <FormInput {...iconProps} />
            </span>
            <h3 id="cs-forms">Forms &amp; data</h3>
          </div>
          <ul>
            <li>
              <strong>Controlled:</strong> <code>value</code> + <code>onChange</code> (React owns state).
            </li>
            <li>
              <strong>Uncontrolled:</strong> <code>defaultValue</code> + <code>ref</code> to read.
            </li>
            <li>
              Prefer <strong>React Query / SWR</strong> (or framework loaders) over raw <code>useEffect</code> +{' '}
              <code>fetch</code> for caching and deduping.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="cs-perf">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Zap {...iconProps} />
            </span>
            <h3 id="cs-perf">Performance &amp; context</h3>
          </div>
          <ul>
            <li>
              <code>React.memo</code> — skip re-render when props are shallow-equal (child must be pure).
            </li>
            <li>
              Split state so frequent updates don&apos;t re-render heavy subtrees.
            </li>
            <li>
              Avoid new object/array/function props every render when passed to <code>memo</code> children.
            </li>
            <li>
              <strong>Context</strong> — good for rarely changing globals (theme, auth); avoid as a general state bus.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="cs-ts">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <FileCode {...iconProps} />
            </span>
            <h3 id="cs-ts">TypeScript snippets</h3>
          </div>
          <ul>
            <li>
              <code>type Props = &#123; title: string; onSave?: () =&gt; void &#125;</code>
            </li>
            <li>
              Events: <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code>,{' '}
              <code>React.MouseEvent&lt;HTMLButtonElement&gt;</code>.
            </li>
          </ul>
        </section>

        <section
          className="react-cheatsheet-section react-cheatsheet-section--caution"
          aria-labelledby="cs-pitfalls"
        >
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <AlertTriangle {...iconProps} />
            </span>
            <h3 id="cs-pitfalls">Common pitfalls</h3>
          </div>
          <ul>
            <li>
              Missing or wrong <strong>effect dependencies</strong> → stale data or infinite loops.
            </li>
            <li>
              Storing <strong>derived state</strong> in <code>useState</code> + syncing with <code>useEffect</code> — derive during
              render instead.
            </li>
            <li>
              Mutating state/props in place — always new references for objects/arrays when updating.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
