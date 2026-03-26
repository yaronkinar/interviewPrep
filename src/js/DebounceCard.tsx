import { useState, useRef } from 'react'
import { debounce } from './utils'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const IMPL = `function debounce(fn, delay) {
  let timer = null

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}`

const USAGE = `// Search input — only query after user stops typing
const search = debounce(async (query) => {
  const results = await fetchResults(query)
  renderResults(results)
}, 300)
input.addEventListener('input', (e) => search(e.target.value))

// Window resize — recalculate layout once resizing stops
const onResize = debounce(() => recalculateLayout(), 200)
window.addEventListener('resize', onResize)`

export default function DebounceCard() {
  const [delay, setDelay] = useState(500)
  const [calls, setCalls] = useState(0)
  const [fires, setFires] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])

  function addLog(text: string, type: LogEntry['type']) {
    setLog(prev => [...prev, { text, type }])
  }

  const debouncedRef = useRef(
    debounce((val: unknown) => {
      setFires(f => f + 1)
      addLog(`→ fired: "${val}"`, 'fire')
    }, delay)
  )

  function updateDelay(newDelay: number) {
    setDelay(newDelay)
    debouncedRef.current = debounce((val: unknown) => {
      setFires(f => f + 1)
      addLog(`→ fired: "${val}"`, 'fire')
    }, newDelay)
    addLog(`Delay updated to ${newDelay}ms`, 'info')
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    setCalls(c => c + 1)
    addLog(`  keystroke: "${e.target.value}"`, 'skip')
    debouncedRef.current(e.target.value)
  }

  return (
    <div className="card">
      <div className="card-title">Debounce</div>
      <p className="card-desc">Fires only after you stop typing for <strong>{delay}ms</strong>. Rapid keystrokes reset the timer.</p>

      <div className="params">
        <span><span className="v">delay</span> =</span>
        <input type="number" value={delay} min={50} max={5000} step={50}
          onChange={e => updateDelay(+e.target.value)} />
        <span>ms</span>
      </div>

      <div className="controls">
        <input type="text" placeholder="Type here…" onChange={onInput}
          style={{ flex: 1, minWidth: 0 }} />
      </div>

      <div className="stat-row">
        <div className="stat"><div className="stat-value">{calls}</div><div className="stat-label">Keystrokes</div></div>
        <div className="stat"><div className="stat-value">{fires}</div><div className="stat-label">Fired</div></div>
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <><code>timer</code> holds the pending timeout. Shared across calls via closure.</> },
          { text: <>Every call cancels the previous timer with <code>clearTimeout</code> — resetting the countdown.</> },
          { text: <>A new timer is scheduled. If no new call arrives before it fires, <code>fn</code> executes.</> },
          { text: <><code>fn</code> only runs once the caller has been <em>quiet</em> for <code>delay</code> ms.</> },
        ]} />
      </CollapsibleCode>
      <CollapsibleCode label="usage" code={USAGE} />
    </div>
  )
}
