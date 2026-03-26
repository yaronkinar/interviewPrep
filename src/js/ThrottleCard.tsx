import { useState, useRef, useCallback } from 'react'
import { throttle, type ThrottleDebugEvent } from './utils'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const IMPL = `function throttle(fn, delay) {
  let lastCall = 0
  let timer = null

  return function (...args) {
    const remaining = delay - (Date.now() - lastCall)
    clearTimeout(timer)

    if (remaining <= 0) {
      fn(...args)
      lastCall = Date.now()
    } else {
      timer = setTimeout(() => {
        fn(...args)
        lastCall = Date.now()
      }, remaining)
    }
  }
}`

const USAGE = `// Mouse move — update UI at most 60fps
const onMouseMove = throttle((e) => {
  updateTooltipPosition(e.clientX, e.clientY)
}, 16)
document.addEventListener('mousemove', onMouseMove)

// Scroll — sync a sticky header
const onScroll = throttle(() => {
  header.style.opacity = window.scrollY > 100 ? '1' : '0'
}, 100)
window.addEventListener('scroll', onScroll)`

export default function ThrottleCard() {
  const [delay, setDelay] = useState(500)
  const [moves, setMoves] = useState(0)
  const [fires, setFires] = useState(0)
  const [barWidth, setBarWidth] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const barTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const addLog = useCallback((text: string, type: LogEntry['type']) => {
    setLog(prev => [...prev, { text, type }])
  }, [])

  const makeThrottled = useCallback((d: number) =>
    throttle((x: unknown, y: unknown) => {
      setFires(f => f + 1)
      setBarWidth(100)
      if (barTimerRef.current) clearTimeout(barTimerRef.current)
      barTimerRef.current = setTimeout(() => setBarWidth(0), d)
      addLog(`→ fired at (${x}, ${y})`, 'fire')
    }, d, (event: ThrottleDebugEvent) => {
      if (event.phase === 'calc') {
        addLog(
          `calc: ${event.delay} - (${event.now} - ${event.lastCall}) = ${event.remaining}ms`,
          'log'
        )
      } else if (event.phase === 'scheduled') {
        addLog(`remaining > 0, schedule in ${Math.max(0, Math.round(event.remaining))}ms`, 'info')
      } else if (event.phase === 'immediate-fire') {
        addLog(`remaining <= 0, fire immediately at ${event.now}`, 'info')
      } else if (event.phase === 'scheduled-fire') {
        addLog(`scheduled fire executed at ${event.now}`, 'info')
      }
    }), [addLog])

  const handlerRef = useRef(makeThrottled(delay))

  function updateDelay(newDelay: number) {
    setDelay(newDelay)
    handlerRef.current = makeThrottled(newDelay)
    addLog(`Delay updated to ${newDelay}ms`, 'info')
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setMoves(m => m + 1)
    handlerRef.current(
      Math.round(e.clientX - rect.left),
      Math.round(e.clientY - rect.top)
    )
  }

  return (
    <div className="card">
      <div className="card-title">Throttle</div>
      <p className="card-desc">Move your mouse over the box. The handler fires at most once per <strong>{delay}ms</strong>.</p>

      <div className="params">
        <span><span className="v">delay</span> =</span>
        <input type="number" value={delay} min={50} max={5000} step={50}
          onChange={e => updateDelay(+e.target.value)} />
        <span>ms</span>
      </div>

      <div className="throttle-zone" onMouseMove={onMouseMove}>Move mouse here</div>
      <div className="bar-wrap"><div className="bar" style={{ width: `${barWidth}%` }} /></div>

      <div className="stat-row">
        <div className="stat"><div className="stat-value">{moves}</div><div className="stat-label">Mouse events</div></div>
        <div className="stat"><div className="stat-value">{fires}</div><div className="stat-label">Fired</div></div>
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <><code>lastCall</code> tracks when <code>fn</code> last ran. <code>remaining</code> = ms left in the window.</> },
          { text: <><code>clearTimeout</code> is called every invocation so the trailing timer always uses the latest args.</> },
          { text: <><strong>Leading call</strong> — if the window expired, fire immediately and stamp <code>lastCall</code>.</> },
          { text: <><strong>Trailing call</strong> — schedule <code>fn</code> to fire at the end of the window. The last burst call is never dropped.</> },
        ]} />
      </CollapsibleCode>
      <CollapsibleCode label="usage" code={USAGE} />
    </div>
  )
}
