import { useState } from 'react'
import { useFetch } from './hooks'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const ENDPOINTS = [
  { label: 'Todo #1',  url: 'https://jsonplaceholder.typicode.com/todos/1' },
  { label: 'Todo #5',  url: 'https://jsonplaceholder.typicode.com/todos/5' },
  { label: 'User #1',  url: 'https://jsonplaceholder.typicode.com/users/1' },
  { label: 'Post #1',  url: 'https://jsonplaceholder.typicode.com/posts/1' },
  { label: '404 error', url: 'https://jsonplaceholder.typicode.com/nonexistent' },
]

const IMPL = `function useFetch(url) {
  const [state, setState] = useState({
    data: null, loading: true, error: null
  })

  useEffect(() => {
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(\`HTTP \${r.status}\`); return r.json() })
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }) })
      .catch(e  => { if (!cancelled) setState({ data: null, loading: false, error: e.message }) })

    return () => { cancelled = true }  // cleanup: prevent stale updates
  }, [url])

  return state
}`

export default function UseFetchDemo() {
  const [urlIndex, setUrlIndex] = useState(0)
  const { data, loading, error, refetch } = useFetch<Record<string, unknown>>(ENDPOINTS[urlIndex].url)

  return (
    <div className="card">
      <div className="card-title">useFetch</div>
      <p className="card-desc">
        Custom hook that fetches data and tracks <code>loading</code> / <code>error</code> / <code>data</code> state.
        Cancels in-flight requests on URL change or unmount.
      </p>

      <div className="controls" style={{ flexWrap: 'wrap' }}>
        {ENDPOINTS.map((ep, i) => (
          <button
            key={i}
            className={i !== urlIndex ? 'secondary' : undefined}
            onClick={() => setUrlIndex(i)}
          >
            {ep.label}
          </button>
        ))}
        <button className="secondary" onClick={refetch}>↺ Refetch</button>
      </div>

      <div className="demo-output">
        {loading && <div className="loading">Fetching {ENDPOINTS[urlIndex].url}…</div>}
        {error   && <div className="error-msg">Error: {error}</div>}
        {!loading && !error && data && Object.entries(data).map(([k, v]) => (
          <div key={k} className="data-field">
            <span className="field-key">{k}:</span>
            <span className="field-val">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <>A <code>cancelled</code> flag prevents state updates after the component unmounts or the URL changes.</> },
          { text: <><code>setState</code> is called with <code>loading: true</code> at the start of every fetch.</> },
          { text: <>Non-2xx responses are converted to errors via <code>r.ok</code> check before <code>.json()</code>.</> },
          { text: <>The cleanup function (<code>return () =&gt; &#123; cancelled = true &#125;</code>) runs when the effect re-fires or the component unmounts.</> },
        ]} />
      </CollapsibleCode>
    </div>
  )
}
