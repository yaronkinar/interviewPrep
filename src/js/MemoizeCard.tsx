import { useState, useRef } from 'react'
import { memoize } from './utils'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}

const IMPL = `function memoize(fn, maxSize = Infinity) {
  const cache = new Map()

  return function (...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    const value = fn(...args)
    cache.set(key, value)
    return value
  }
}`

const USAGE = `const memoFib = memoize(fib)
memoFib(35)  // computes (slow)
memoFib(35)  // returns from cache instantly

// API response caching
const fetchUser = memoize(async (id) => {
  const res = await fetch(\`/api/users/\${id}\`)
  return res.json()
})
await fetchUser(42)  // network request
await fetchUser(42)  // cache hit`

export default function MemoizeCard() {
  const [n, setN] = useState(10)
  const [maxSize, setMaxSize] = useState(10)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])

  const memoRef = useRef(memoize(fib as (...args: unknown[]) => unknown, 10))

  function addLog(text: string, type: LogEntry['type']) {
    setLog(prev => [...prev, { text, type }])
  }

  function rebuildMemo(newMax: number) {
    memoRef.current = memoize(fib as (...args: unknown[]) => unknown, newMax)
    setHits(0); setMisses(0); setLog([])
    addLog(`Cache rebuilt — max size: ${newMax}`, 'info')
  }

  function runMemo() {
    const t0 = performance.now()
    const { value, fromCache } = memoRef.current(n) as { value: number; fromCache: boolean }
    const ms = (performance.now() - t0).toFixed(2)
    if (fromCache) {
      setHits(h => h + 1)
      addLog(`fib(${n}) = ${value}  ✓ cache hit  ${ms}ms`, 'hit')
    } else {
      setMisses(m => m + 1)
      addLog(`fib(${n}) = ${value}  ✗ computed  ${ms}ms`, 'miss')
    }
  }

  function clearCache() {
    memoRef.current.clear()
    setHits(0); setMisses(0)
    addLog('Cache cleared', 'info')
  }

  return (
    <div className="card">
      <div className="card-title">Memoize</div>
      <p className="card-desc">Caches results by arguments. Same args → instant return, no recomputation.</p>

      <div className="params">
        <span><span className="v">fn</span> = fib &nbsp;|&nbsp; <span className="v">n</span> =</span>
        <input type="number" value={n} min={1} max={40} onChange={e => setN(+e.target.value)} />
        <span>&nbsp;|&nbsp; max cache =</span>
        <input type="number" value={maxSize} min={1} max={100}
          onChange={e => { const v = +e.target.value; setMaxSize(v); rebuildMemo(v) }} />
      </div>

      <div className="controls">
        <button onClick={runMemo}>compute fib(n)</button>
        <button className="secondary" onClick={clearCache}>clear cache</button>
      </div>

      <div className="stat-row">
        <div className="stat"><div className="stat-value">{hits}</div><div className="stat-label">Cache hits</div></div>
        <div className="stat"><div className="stat-value">{misses}</div><div className="stat-label">Computed</div></div>
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <><code>cache</code> is a <code>Map</code> that lives in the closure — persists across every call.</> },
          { text: <>Args are serialized into a string <code>key</code> via <code>JSON.stringify</code>. Same args → same key.</> },
          { text: <>Cache hit → return immediately, no computation.</> },
          { text: <>Cache miss → run <code>fn</code>, store the result. Next call with same args will hit.</> },
        ]} />
      </CollapsibleCode>
      <CollapsibleCode label="usage" code={USAGE} />
    </div>
  )
}
