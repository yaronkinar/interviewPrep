import { useState, useRef, useCallback } from 'react'
import { throttle, type ThrottleDebugEvent } from './utils'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

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
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
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
    addLog(ui.js.throttle.delayUpdated.replace('{delay}', String(newDelay)), 'info')
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
      <div className="js-card-head">
        <div>
          <div className="card-title">{ui.js.throttle.title}</div>
          <p className="card-desc">{ui.js.throttle.description.replace('{delay}', String(delay))}</p>
        </div>
        <span className="js-card-icon" aria-hidden>↯</span>
      </div>

      <div className="params">
        <span><span className="v">delay</span> =</span>
        <input type="number" value={delay} min={50} max={5000} step={50}
          onChange={e => updateDelay(+e.target.value)} />
        <span>ms</span>
      </div>

      <div className="throttle-zone" onMouseMove={onMouseMove}>{ui.js.throttle.moveMouseHere}</div>
      <div className="bar-wrap"><div className="bar" style={{ width: `${barWidth}%` }} /></div>

      <div className="stat-row">
        <div className="stat"><div className="stat-value">{moves}</div><div className="stat-label">{ui.js.throttle.mouseEvents}</div></div>
        <div className="stat"><div className="stat-value">{fires}</div><div className="stat-label">{ui.js.throttle.fired}</div></div>
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label={ui.js.common.implementation} code={IMPL}>
        <Explanation steps={ui.js.throttle.explainSteps.map(step => ({ text: <>{step}</> }))} />
      </CollapsibleCode>
      <CollapsibleCode label={ui.js.common.usage} code={USAGE} />
    </div>
  )
}
