import {
  Braces,
  FileCode,
  Layers,
  MousePointerClick,
  Puzzle,
  Zap,
} from 'lucide-react'

const iconProps = { size: 16, strokeWidth: 2, className: 'react-cheatsheet-svg' } as const

export default function VueCheatsheet() {
  return (
    <div className="card react-cheatsheet-card">
      <header className="react-cheatsheet-header">
        <div className="card-title">Vue 3 cheatsheet</div>
        <p className="card-desc react-cheatsheet-lead">
          Composition API, reactivity, and how Vue compares to React in interviews.
        </p>
      </header>

      <div className="react-cheatsheet-columns">
        <section className="react-cheatsheet-section" aria-labelledby="vue-setup">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <FileCode {...iconProps} />
            </span>
            <h3 id="vue-setup">script setup</h3>
          </div>
          <ul>
            <li>
              Top-level bindings (refs, functions, imports) are exposed to the template automatically — less boilerplate
              than Options API <code>setup()</code> return object.
            </li>
            <li>
              Use <code>defineProps</code> / <code>defineEmits</code> compiler macros for typed props and events.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="vue-refs">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Layers {...iconProps} />
            </span>
            <h3 id="vue-refs">Reactivity</h3>
          </div>
          <ul>
            <li>
              <code>ref</code> — reactive primitive or object; access <code>.value</code> in script, unwrap in template.
            </li>
            <li>
              <code>reactive</code> — proxy object; good for local form state; lose reactivity if you destructure without{' '}
              <code>toRefs</code>.
            </li>
            <li>
              <code>computed</code> — derived state with caching; analogous to memoized selectors.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="vue-watch">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <MousePointerClick {...iconProps} />
            </span>
            <h3 id="vue-watch">watch vs watchEffect</h3>
          </div>
          <ul>
            <li>
              <code>watch(source, cb)</code> — lazy; runs when tracked sources change; access previous value.
            </li>
            <li>
              <code>watchEffect</code> — runs immediately; auto-tracks dependencies — closer to “sync effect” mental model.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="vue-prov">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Puzzle {...iconProps} />
            </span>
            <h3 id="vue-prov">Provide / inject</h3>
          </div>
          <ul>
            <li>
              Dependency injection across the tree — compare to React Context; mind readability and update frequency.
            </li>
            <li>
              Prefer explicit props for shallow trees; provide/inject for plugin-style or deeply nested shared services.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section" aria-labelledby="vue-router">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Braces {...iconProps} />
            </span>
            <h3 id="vue-router">Router (Vue Router 4)</h3>
          </div>
          <ul>
            <li>
              <code>useRouter()</code> / <code>useRoute()</code> in Composition API — programmatic navigation vs reading params.
            </li>
            <li>
              Navigation guards (global, per-route, in-component) — common senior-level discussion topic.
            </li>
          </ul>
        </section>

        <section className="react-cheatsheet-section react-cheatsheet-section--caution" aria-labelledby="vue-pitfalls">
          <div className="react-cheatsheet-section-head">
            <span className="react-cheatsheet-section-icon" aria-hidden>
              <Zap {...iconProps} />
            </span>
            <h3 id="vue-pitfalls">Interview angles</h3>
          </div>
          <ul>
            <li>
              Reactivity caveats with arrays/objects replacement vs mutation depending on API choice.
            </li>
            <li>
              Performance: <code>v-once</code>, <code>v-memo</code>, async components, and when to split SFCs.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
