import { useRef, useState } from 'react'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

type LogType = 'sync' | 'micro' | 'macro'
type LogEntry = { type: LogType; text: string }
type Scenario = 'basic' | 'nested'

const IMPL = `console.log('sync: 1')

setTimeout(() => {
  console.log('macro: timeout')
}, 0)

Promise.resolve().then(() => {
  console.log('micro: promise.then')
})

queueMicrotask(() => {
  console.log('micro: queueMicrotask')
})

console.log('sync: 2')

// Expected order:
// sync: 1
// sync: 2
// micro: promise.then
// micro: queueMicrotask
// macro: timeout`

const NESTED_IMPL = `console.log('sync: start')

setTimeout(() => {
  console.log('macro: timeout 1')

  Promise.resolve().then(() => {
    console.log('micro: inside timeout 1')
  })
}, 0)

Promise.resolve().then(() => {
  console.log('micro: top-level then')

  setTimeout(() => {
    console.log('macro: timeout 2 from micro')
  }, 0)
})

console.log('sync: end')

// Typical order:
// sync: start
// sync: end
// micro: top-level then
// macro: timeout 1
// micro: inside timeout 1
// macro: timeout 2 from micro`

export default function EventLoopDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [scenario, setScenario] = useState<Scenario>('basic')
  const runIdRef = useRef(0)

  const pushLog = (entry: LogEntry) => {
    setLogs((prev) => [...prev, entry])
  }

  const runBasicDemo = () => {
    const runId = ++runIdRef.current
    setLogs([{ type: 'sync', text: `run #${runId} (basic) started` }])

    pushLog({ type: 'sync', text: 'sync: 1' })

    setTimeout(() => {
      setLogs((prev) =>
        runIdRef.current === runId
          ? [...prev, { type: 'macro', text: 'macro: setTimeout(0)' }]
          : prev
      )
    }, 0)

    Promise.resolve().then(() => {
      setLogs((prev) =>
        runIdRef.current === runId
          ? [...prev, { type: 'micro', text: 'micro: Promise.then' }]
          : prev
      )
    })

    queueMicrotask(() => {
      setLogs((prev) =>
        runIdRef.current === runId
          ? [...prev, { type: 'micro', text: 'micro: queueMicrotask' }]
          : prev
      )
    })

    pushLog({ type: 'sync', text: 'sync: 2' })
  }

  const runNestedDemo = () => {
    const runId = ++runIdRef.current
    setLogs([{ type: 'sync', text: `run #${runId} (nested) started` }])

    pushLog({ type: 'sync', text: 'sync: start' })

    setTimeout(() => {
      setLogs((prev) =>
        runIdRef.current === runId
          ? [...prev, { type: 'macro', text: 'macro: timeout 1' }]
          : prev
      )

      Promise.resolve().then(() => {
        setLogs((prev) =>
          runIdRef.current === runId
            ? [...prev, { type: 'micro', text: 'micro: inside timeout 1' }]
            : prev
        )
      })
    }, 0)

    Promise.resolve().then(() => {
      setLogs((prev) =>
        runIdRef.current === runId
          ? [...prev, { type: 'micro', text: 'micro: top-level then' }]
          : prev
      )

      setTimeout(() => {
        setLogs((prev) =>
          runIdRef.current === runId
            ? [...prev, { type: 'macro', text: 'macro: timeout 2 from micro' }]
            : prev
        )
      }, 0)
    })

    pushLog({ type: 'sync', text: 'sync: end' })
  }

  const color = (type: LogType) => {
    if (type === 'sync') return 'var(--hit)'
    if (type === 'micro') return 'var(--fire)'
    return 'var(--text-faint)'
  }

  return (
    <div className="card">
      <div className="card-title">Event Loop Order</div>
      <p className="card-desc">
        Demonstrates JS execution order between synchronous code, microtasks, and macrotasks.
      </p>

      <div className="controls">
        <button className={scenario === 'basic' ? undefined : 'secondary'} onClick={() => setScenario('basic')}>
          Basic
        </button>
        <button className={scenario === 'nested' ? undefined : 'secondary'} onClick={() => setScenario('nested')}>
          Nested
        </button>
        <button onClick={scenario === 'basic' ? runBasicDemo : runNestedDemo}>Run demo</button>
        <button className="secondary" onClick={() => setLogs([])}>Clear</button>
      </div>

      <div className="demo-output" style={{ minHeight: 120 }}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>
            Click "Run demo" to see ordering.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="data-field">
              <span className="field-key" style={{ color: color(log.type) }}>{log.type}</span>
              <span className="field-val">{log.text}</span>
            </div>
          ))
        )}
      </div>

      <CollapsibleCode label="implementation" code={scenario === 'basic' ? IMPL : NESTED_IMPL}>
        <Explanation
          steps={[
            { text: <>Synchronous statements execute immediately in call-stack order.</> },
            { text: <>Microtasks (<code>Promise.then</code>, <code>queueMicrotask</code>) run after sync code completes.</> },
            { text: <>Macrotasks like <code>setTimeout</code> run after the microtask queue is drained.</> },
            { text: <>In nested scenarios, each macrotask also drains any microtasks created inside it before moving on.</> },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}

