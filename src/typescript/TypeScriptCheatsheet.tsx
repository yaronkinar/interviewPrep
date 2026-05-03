import {
  Braces,
  FileCode,
  Layers,
  Shield,
  Type,
  Zap,
} from 'lucide-react'

const iconProps = { size: 16, strokeWidth: 2, className: 'react-cheatsheet-svg' } as const

export default function TypeScriptCheatsheet() {
  return (
    <div className="card react-cheatsheet-card">
      <header className="react-cheatsheet-header">
        <div className="card-title">TypeScript cheatsheet</div>
        <p className="card-desc react-cheatsheet-lead">
          Structural typing, narrowing, and generics — common talking points in frontend interviews.
        </p>
      </header>

      <div className="react-cheatsheet-columns">
        <section className="react-cheatsheet-section" aria-labelledby="ts-types">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Type {...iconProps} />
            </span>
            <h3 id="ts-types">Types vs interfaces</h3>
          </div>
          <ul>
            <li>
              <strong>interface</strong> — extendable, declaration merging for libs; familiar for OOP-shaped APIs.
            </li>
            <li>
              <strong>type</strong> — unions, intersections, mapped types; use for discriminated unions and conditional
              types.
            </li>
            <li>
              Both participate in <strong>structural typing</strong>: matching shape matters, not the name.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ts-narrow">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Shield {...iconProps} />
            </span>
            <h3 id="ts-narrow">Narrowing</h3>
          </div>
          <ul>
            <li>
              <code>typeof</code>, <code>instanceof</code>, truthiness checks.
            </li>
            <li>
              Discriminated unions: a shared literal field (e.g. <code>kind</code>, <code>status</code>) switches types.
            </li>
            <li>
              <code>in</code> operator for object shapes; <code>switch (true)</code> patterns for complex guards.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ts-gen">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Layers {...iconProps} />
            </span>
            <h3 id="ts-gen">Generics</h3>
          </div>
          <ul>
            <li>
              <code>&lt;T&gt;</code> preserves relationships between inputs and outputs (e.g. <code>Promise&lt;T&gt;</code>,{' '}
              <code>Array&lt;T&gt;</code>).
            </li>
            <li>
              Constraints: <code>&lt;T extends U&gt;</code> so <code>T</code> has known fields.
            </li>
            <li>
              Defaults: <code>&lt;T = string&gt;</code> when callers often omit the type argument.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ts-util">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Braces {...iconProps} />
            </span>
            <h3 id="ts-util">Utility types</h3>
          </div>
          <ul>
            <li>
              <code>Partial&lt;T&gt;</code>, <code>Required&lt;T&gt;</code>, <code>Readonly&lt;T&gt;</code>.
            </li>
            <li>
              <code>Pick&lt;T, K&gt;</code>, <code>Omit&lt;T, K&gt;</code>, <code>Record&lt;K, V&gt;</code>.
            </li>
            <li>
              <code>Parameters&lt;typeof fn&gt;</code>, <code>ReturnType&lt;typeof fn&gt;</code> for inference-driven APIs.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="ts-mod">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <FileCode {...iconProps} />
            </span>
            <h3 id="ts-mod">Modules &amp; DTS</h3>
          </div>
          <ul>
            <li>
              <code>import type</code> erases at emit — good for type-only deps and avoiding circular runtime imports.
            </li>
            <li>
              Ambient declarations (<code>.d.ts</code>) describe untyped JS or globals.
            </li>
            <li>
              <code>satisfies</code> checks literals against a type without widening inferred literals.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section react-cheatsheet-section--caution" aria-labelledby="ts-pitfalls">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Zap {...iconProps} />
            </span>
            <h3 id="ts-pitfalls">Interview pitfalls</h3>
          </div>
          <ul>
            <li>
              <code>any</code> disables checking; <code>unknown</code> forces narrowing before use.
            </li>
            <li>
              Excess property checks apply to object literals, not variables — know why assignments sometimes slip through.
            </li>
            <li>
              <code>enum</code> runtime semantics vs string unions — trade-offs for tree-shaking and ergonomics.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
