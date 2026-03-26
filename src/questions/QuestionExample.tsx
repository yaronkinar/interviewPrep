import { useMemo, useRef, useState } from 'react'

type Props = {
  questionId: string
}

type LogType = 'event' | 'result'
type LogEntry = { text: string; type: LogType }

const GROUP_BY_SAMPLE = JSON.stringify(
  [
    { id: 1, team: 'A', role: 'FE' },
    { id: 2, team: 'B', role: 'BE' },
    { id: 3, team: 'A', role: 'QA' },
    { id: 4, team: 'B', role: 'FE' },
  ],
  null,
  2
)

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: unknown[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  } as T
}

function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastCall = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: unknown[]) {
    const remaining = delay - (Date.now() - lastCall)
    if (timer) clearTimeout(timer)
    if (remaining <= 0) {
      fn(...args)
      lastCall = Date.now()
      timer = null
    } else {
      timer = setTimeout(() => {
        fn(...args)
        lastCall = Date.now()
        timer = null
      }, remaining)
    }
  } as T
}

function groupBy<T extends Record<string, unknown>>(
  items: T[],
  selector: string | ((item: T) => unknown)
) {
  const getKey =
    typeof selector === 'function'
      ? selector
      : (item: T) => item?.[selector]

  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = String(getKey(item))
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

function flat(arr: unknown[], depth = 1): unknown[] {
  if (depth === 0) return arr.slice()

  return arr.reduce<unknown[]>((result, item) => {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flat(item, depth - 1))
    } else {
      result.push(item)
    }
    return result
  }, [])
}

function fibRaw(n: number): number {
  if (n <= 1) return n
  return fibRaw(n - 1) + fibRaw(n - 2)
}

function DebounceExample() {
  const [delay, setDelay] = useState(300)
  const [events, setEvents] = useState(0)
  const [fires, setFires] = useState(0)
  const [value, setValue] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])

  const handlerRef = useRef(
    debounce((v: unknown) => {
      setFires((f) => f + 1)
      setLog((prev) => [...prev.slice(-6), { text: `fired with "${String(v)}"`, type: 'result' }])
    }, delay)
  )

  function updateDelay(nextDelay: number) {
    setDelay(nextDelay)
    handlerRef.current = debounce((v: unknown) => {
      setFires((f) => f + 1)
      setLog((prev) => [...prev.slice(-6), { text: `fired with "${String(v)}"`, type: 'result' }])
    }, nextDelay)
  }

  return (
    <div className="q-demo">
      <div className="q-demo-title">Debounce playground</div>
      <input
        className="q-demo-input"
        value={value}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          setEvents((c) => c + 1)
          setLog((prev) => [...prev.slice(-6), { text: `typed "${next}"`, type: 'event' }])
          handlerRef.current(next)
        }}
        placeholder="Type quickly..."
      />
      <div className="q-demo-controls">
        <label>delay: {delay}ms</label>
        <input type="range" min={100} max={1000} step={50} value={delay} onChange={(e) => updateDelay(+e.target.value)} />
      </div>
      <div className="q-demo-stats">
        <span>events: {events}</span>
        <span>fires: {fires}</span>
      </div>
      <div className="q-demo-log">
        {log.map((line, i) => <div key={i} className={line.type}>{line.text}</div>)}
      </div>
    </div>
  )
}

function ThrottleExample() {
  const [delay, setDelay] = useState(250)
  const [events, setEvents] = useState(0)
  const [fires, setFires] = useState(0)
  const [progress, setProgress] = useState(0)

  const handlerRef = useRef(
    throttle((x: unknown) => {
      setFires((f) => f + 1)
      setProgress(Number(x))
    }, delay)
  )

  function updateDelay(nextDelay: number) {
    setDelay(nextDelay)
    handlerRef.current = throttle((x: unknown) => {
      setFires((f) => f + 1)
      setProgress(Number(x))
    }, nextDelay)
  }

  return (
    <div className="q-demo">
      <div className="q-demo-title">Throttle playground</div>
      <input
        type="range"
        min={0}
        max={100}
        value={progress}
        onChange={(e) => {
          const next = +e.target.value
          setEvents((c) => c + 1)
          handlerRef.current(next)
        }}
      />
      <div className="q-demo-controls">
        <label>delay: {delay}ms</label>
        <input type="range" min={100} max={1000} step={50} value={delay} onChange={(e) => updateDelay(+e.target.value)} />
      </div>
      <div className="q-demo-stats">
        <span>events: {events}</span>
        <span>fires: {fires}</span>
        <span>value: {progress}</span>
      </div>
      <div className="q-demo-bar">
        <div className="q-demo-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function MemoizeExample() {
  const [n, setN] = useState(35)
  const [runs, setRuns] = useState(0)
  const cacheRef = useRef(new Map<number, number>())

  const result = useMemo(() => {
    const t0 = performance.now()
    let fromCache = false
    let value = cacheRef.current.get(n)
    if (value === undefined) {
      value = fibRaw(n)
      cacheRef.current.set(n, value)
    } else {
      fromCache = true
    }
    const ms = (performance.now() - t0).toFixed(2)
    return { value, fromCache, ms }
    // Only recompute when n or runs changes.
  }, [n, runs])

  return (
    <div className="q-demo">
      <div className="q-demo-title">Memoize playground</div>
      <div className="q-demo-controls">
        <label>fib(n):</label>
        <input type="number" min={1} max={42} value={n} onChange={(e) => setN(+e.target.value)} />
        <button onClick={() => setRuns((r) => r + 1)}>Run</button>
        <button className="secondary" onClick={() => cacheRef.current.clear()}>Clear cache</button>
      </div>
      <div className="q-demo-stats">
        <span>result: {result.value}</span>
        <span>time: {result.ms}ms</span>
        <span>{result.fromCache ? 'cache hit' : 'computed'}</span>
      </div>
    </div>
  )
}

function GroupByExample() {
  const [source, setSource] = useState(GROUP_BY_SAMPLE)
  const [key, setKey] = useState('team')

  let output = '{}'
  let error = ''

  try {
    const parsed = JSON.parse(source) as Array<Record<string, unknown>>
    output = JSON.stringify(groupBy(parsed, key), null, 2)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Invalid JSON'
  }

  return (
    <div className="q-demo">
      <div className="q-demo-title">groupBy playground</div>
      <div className="q-demo-controls">
        <label>key:</label>
        <input className="q-demo-input" value={key} onChange={(e) => setKey(e.target.value)} />
      </div>
      <textarea
        className="q-demo-textarea"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      {error ? (
        <div className="q-demo-error">JSON error: {error}</div>
      ) : (
        <pre className="q-demo-pre">{output}</pre>
      )}
    </div>
  )
}

function FlatArrayExample() {
  const [source, setSource] = useState('[1, [2, [3, [4, 5]]], 6]')
  const [depth, setDepth] = useState(1)

  let output = '[]'
  let error = ''

  try {
    const parsed = JSON.parse(source) as unknown[]
    output = JSON.stringify(flat(parsed, depth))
  } catch (err) {
    error = err instanceof Error ? err.message : 'Invalid JSON'
  }

  return (
    <div className="q-demo">
      <div className="q-demo-title">Flat array playground</div>
      <div className="q-demo-controls">
        <label>depth:</label>
        <input type="number" min={0} max={10} value={depth} onChange={(e) => setDepth(+e.target.value)} />
      </div>
      <input className="q-demo-input" value={source} onChange={(e) => setSource(e.target.value)} />
      {error ? (
        <div className="q-demo-error">JSON error: {error}</div>
      ) : (
        <div className="q-demo-result">{output}</div>
      )}
    </div>
  )
}

export function hasQuestionExample(questionId: string) {
  return ['debounce', 'throttle', 'memoize', 'group-by-dictionary', 'flatten-array'].includes(questionId)
}

export function QuestionExample({ questionId }: Props) {
  switch (questionId) {
    case 'debounce':
      return <DebounceExample />
    case 'throttle':
      return <ThrottleExample />
    case 'memoize':
      return <MemoizeExample />
    case 'group-by-dictionary':
      return <GroupByExample />
    case 'flatten-array':
      return <FlatArrayExample />
    default:
      return null
  }
}
