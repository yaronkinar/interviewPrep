import { useState } from 'react'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

type User = { id: number; name: string; active: boolean }

const USERS: User[] = [
  { id: 1, name: 'Ada',     active: false },
  { id: 2, name: 'Brian',   active: true  },
  { id: 3, name: 'Cleo',    active: false },
  { id: 4, name: 'Dax',     active: true  },
  { id: 5, name: 'Eve',     active: true  },
  { id: 6, name: 'Finn',    active: false },
]

const IMPL = `// find — returns the FIRST matching element (or undefined)
// Stops iterating as soon as the predicate returns true.
Array.prototype.myFind = function (predicate) {
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) return this[i]
  }
  return undefined
}

// filter — returns a NEW ARRAY with ALL matching elements ([] if none)
// Always iterates the entire array.
Array.prototype.myFilter = function (predicate) {
  const out = []
  for (let i = 0; i < this.length; i++) {
    if (predicate(this[i], i, this)) out.push(this[i])
  }
  return out
}`

const USAGE = `const users = [
  { id: 1, active: false },
  { id: 2, active: true  },
  { id: 3, active: true  },
]

// Need ONE item? -> find
const firstActive = users.find(u => u.active)
// { id: 2, active: true }

// Need a SUBSET? -> filter
const allActive = users.filter(u => u.active)
// [{ id: 2, ... }, { id: 3, ... }]

// Nothing matches:
users.find(u => u.id === 99)    // undefined
users.filter(u => u.id === 99)  // []

// Cousins worth knowing:
users.findIndex(u => u.active)  // 1   (index, not element)
users.some(u => u.active)       // true  (short-circuits)
users.every(u => u.active)      // false`

const EXPLAIN_STEPS = [
  <>Both methods walk the array and call your predicate on each element.</>,
  <><code>find</code> short-circuits — it returns the first element that matches and stops iterating.</>,
  <><code>filter</code> never short-circuits — it always visits every element and collects matches into a new array.</>,
  <>If nothing matches: <code>find</code> returns <code>undefined</code>, <code>filter</code> returns <code>[]</code> (still truthy!).</>,
  <>Rule of thumb: need <em>one</em> item → <code>find</code>; need a <em>subset</em> → <code>filter</code>.</>,
]

export default function FindVsFilterCard() {
  const [predicateSrc, setPredicateSrc] = useState('u.active')
  const [findIters, setFindIters] = useState(0)
  const [filterIters, setFilterIters] = useState(0)
  const [findResult, setFindResult] = useState<string>('—')
  const [filterResult, setFilterResult] = useState<string>('—')
  const [log, setLog] = useState<LogEntry[]>([])

  function addLog(text: string, type: LogEntry['type']) {
    setLog(prev => [...prev, { text, type }])
  }

  function compilePredicate(): ((u: User) => boolean) | null {
    try {
      const fn = new Function('u', `return (${predicateSrc})`) as (u: User) => boolean
      fn(USERS[0])
      return fn
    } catch (err) {
      addLog(`predicate error: ${(err as Error).message}`, 'error')
      return null
    }
  }

  function run() {
    const predicate = compilePredicate()
    if (!predicate) return

    setLog([])
    addLog(`predicate: u => ${predicateSrc}`, 'info')
    addLog('— find() —', 'sep')

    let fIters = 0
    let found: User | undefined
    for (let i = 0; i < USERS.length; i++) {
      fIters++
      const u = USERS[i]
      const ok = !!predicate(u)
      addLog(`  [${i}] check ${u.name} (active=${u.active}) -> ${ok}`, ok ? 'hit' : 'log')
      if (ok) { found = u; addLog(`  ↳ short-circuit, return ${u.name}`, 'fire'); break }
    }
    if (!found) addLog('  ↳ no match, return undefined', 'skip')
    setFindIters(fIters)
    setFindResult(found ? `{ id: ${found.id}, name: "${found.name}" }` : 'undefined')

    addLog('— filter() —', 'sep')
    let fltIters = 0
    const matches: User[] = []
    for (let i = 0; i < USERS.length; i++) {
      fltIters++
      const u = USERS[i]
      const ok = !!predicate(u)
      addLog(`  [${i}] check ${u.name} (active=${u.active}) -> ${ok}`, ok ? 'hit' : 'log')
      if (ok) matches.push(u)
    }
    addLog(`  ↳ return array of ${matches.length} item(s)`, 'fire')
    setFilterIters(fltIters)
    setFilterResult(
      matches.length === 0
        ? '[]'
        : `[${matches.map(u => `"${u.name}"`).join(', ')}]`
    )
  }

  function reset() {
    setLog([])
    setFindIters(0)
    setFilterIters(0)
    setFindResult('—')
    setFilterResult('—')
  }

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">find() vs filter()</div>
          <p className="card-desc">
            Both iterate &amp; test a predicate. <code>find</code> returns the first match
            (and stops). <code>filter</code> returns every match (and never stops early).
          </p>
        </div>
        <span className="js-card-icon" aria-hidden>⚖</span>
      </div>

      <div className="params">
        <span><span className="v">predicate</span> = u =&gt;</span>
        <input
          type="text"
          value={predicateSrc}
          onChange={e => setPredicateSrc(e.target.value)}
          style={{ flex: 1, minWidth: 0, fontFamily: 'monospace' }}
          spellCheck={false}
        />
      </div>

      <div className="controls">
        <button onClick={run}>Run on {USERS.length} users</button>
        <button className="secondary" onClick={reset}>Reset</button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-value">{findIters}</div>
          <div className="stat-label">find() iters</div>
        </div>
        <div className="stat">
          <div className="stat-value">{filterIters}</div>
          <div className="stat-label">filter() iters</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat" style={{ flex: 1, minWidth: 0 }}>
          <div className="stat-value" style={{ fontSize: '0.95rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {findResult}
          </div>
          <div className="stat-label">find() returned</div>
        </div>
        <div className="stat" style={{ flex: 1, minWidth: 0 }}>
          <div className="stat-value" style={{ fontSize: '0.95rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {filterResult}
          </div>
          <div className="stat-label">filter() returned</div>
        </div>
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={EXPLAIN_STEPS.map(text => ({ text }))} />
      </CollapsibleCode>
      <CollapsibleCode label="usage" code={USAGE} />
    </div>
  )
}
