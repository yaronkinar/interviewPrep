import { useState, useRef } from 'react'
import { debounce } from './utils'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

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
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const [delay, setDelay] = useState(500)
  const [calls, setCalls] = useState(0)
  const [fires, setFires] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const scheduledAtRef = useRef<number | null>(null)

  function addLog(text: string, type: LogEntry['type']) {
    setLog(prev => [...prev, { text, type }])
  }

  const debouncedRef = useRef(
    debounce((val: unknown) => {
      scheduledAtRef.current = null
      setFires(f => f + 1)
      addLog(`→ ${ui.js.debounce.fired.toLowerCase()}: "${val}"`, 'fire')
    }, delay)
  )

  function updateDelay(newDelay: number) {
    setDelay(newDelay)
    debouncedRef.current = debounce((val: unknown) => {
      scheduledAtRef.current = null
      setFires(f => f + 1)
      addLog(`→ ${ui.js.debounce.fired.toLowerCase()}: "${val}"`, 'fire')
    }, newDelay)
    addLog(ui.js.debounce.delayUpdated.replace('{delay}', String(newDelay)), 'info')
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const now = Date.now()
    if (scheduledAtRef.current !== null) {
      const elapsed = now - scheduledAtRef.current
      const remaining = Math.max(0, delay - elapsed)
      addLog(
        `${ui.js.common.calcLabel}: ${delay} - (${now} - ${scheduledAtRef.current}) = ${remaining}ms`,
        'log'
      )
    }
    const fireAt = now + delay
    scheduledAtRef.current = now
    addLog(`${ui.js.common.scheduleLabel}: ${now} + ${delay} = ${fireAt}`, 'info')
    setCalls(c => c + 1)
    addLog(`  ${ui.js.debounce.keystrokes.toLowerCase()}: "${e.target.value}"`, 'skip')
    debouncedRef.current(e.target.value)
  }

  return (
    <div className="card">
      <div className="js-card-head">
        <div>
          <div className="card-title">{ui.js.debounce.title}</div>
          <p className="card-desc">{ui.js.debounce.description.replace('{delay}', String(delay))}</p>
        </div>
        <span className="js-card-icon" aria-hidden>◴</span>
      </div>

      <div className="params">
        <span><span className="v">delay</span> =</span>
        <input type="number" value={delay} min={50} max={5000} step={50}
          onChange={e => updateDelay(+e.target.value)} />
        <span>ms</span>
      </div>

      <div className="controls">
        <input type="text" placeholder={ui.js.debounce.inputPlaceholder} onChange={onInput}
          style={{ flex: 1, minWidth: 0 }} />
      </div>

      <div className="stat-row">
        <div className="stat"><div className="stat-value">{calls}</div><div className="stat-label">{ui.js.debounce.keystrokes}</div></div>
        <div className="stat"><div className="stat-value">{fires}</div><div className="stat-label">{ui.js.debounce.fired}</div></div>
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label={ui.js.common.implementation} code={IMPL}>
        <Explanation steps={ui.js.debounce.explainSteps.map(step => ({ text: <>{step}</> }))} />
      </CollapsibleCode>
      <CollapsibleCode label={ui.js.common.usage} code={USAGE} />
    </div>
  )
}
