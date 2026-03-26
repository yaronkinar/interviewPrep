import { useState } from 'react'
import { useDebounce } from './hooks'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

// Simulated search index
const ITEMS = [
  'useEffect', 'useState', 'useCallback', 'useMemo', 'useRef',
  'useContext', 'useReducer', 'useLayoutEffect', 'useDebugValue',
  'forwardRef', 'createContext', 'memo', 'Suspense', 'lazy',
  'React.Fragment', 'createPortal', 'StrictMode', 'Profiler',
]

const IMPL = `function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)  // cancel on next change
  }, [value, delay])

  return debounced
}

// Usage in a component:
const [query, setQuery] = useState('')
const debouncedQuery = useDebounced(query, 300)

useEffect(() => {
  if (debouncedQuery) search(debouncedQuery)
}, [debouncedQuery])`

export default function UseDebounceDemo() {
  const [query, setQuery] = useState('')
  const [delay, setDelay] = useState(400)
  const debouncedQuery = useDebounce(query, delay)

  const results = debouncedQuery
    ? ITEMS.filter(i => i.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : []

  return (
    <div className="card">
      <div className="card-title">useDebounce</div>
      <p className="card-desc">
        Returns a value that only updates after the input has been stable for <strong>{delay}ms</strong>.
        Prevents API calls on every keystroke.
      </p>

      <div className="params">
        <span><span className="v">delay</span> =</span>
        <input type="number" value={delay} min={50} max={2000} step={50}
          onChange={e => setDelay(+e.target.value)} />
        <span>ms</span>
      </div>

      <div className="controls">
        <input
          type="text"
          value={query}
          placeholder="Search React APIs…"
          style={{ flex: 1, minWidth: 0 }}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="demo-output" style={{ minHeight: 80 }}>
        <div className="data-field" style={{ marginBottom: '0.5rem' }}>
          <span className="field-key">live value:</span>
          <span className="field-val" style={{ color: 'var(--fire)' }}>{query || '—'}</span>
        </div>
        <div className="data-field" style={{ marginBottom: '0.75rem' }}>
          <span className="field-key">debounced:</span>
          <span className="field-val" style={{ color: 'var(--hit)' }}>{debouncedQuery || '—'}</span>
        </div>
        {debouncedQuery && (
          results.length
            ? <div className="tag-list">{results.map(r => <span key={r} className="tag">{r}</span>)}</div>
            : <div style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>No matches</div>
        )}
      </div>

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <><code>debounced</code> is a separate state value that lags behind the live input.</> },
          { text: <>Each time <code>value</code> changes, a new timeout is started that will update <code>debounced</code> after <code>delay</code> ms.</> },
          { text: <>The cleanup (<code>clearTimeout</code>) cancels the pending update if <code>value</code> changes again first.</> },
          { text: <>Consumers react to <code>debounced</code>, not <code>value</code> — so expensive work only runs after the user pauses.</> },
        ]} />
      </CollapsibleCode>
    </div>
  )
}
