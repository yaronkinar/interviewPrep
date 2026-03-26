import { useState, useRef, useEffect } from 'react'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const IMPL = `// useRef gives you a mutable box that persists across renders
// without triggering a re-render when it changes.

function Stopwatch() {
  const [display, setDisplay] = useState(0)   // triggers re-render
  const elapsed = useRef(0)                   // does NOT trigger re-render
  const startTime = useRef<number | null>(null)
  const frameId  = useRef<number | null>(null)

  function start() {
    startTime.current = Date.now() - elapsed.current
    function tick() {
      elapsed.current = Date.now() - startTime.current!
      setDisplay(elapsed.current)              // update display periodically
      frameId.current = requestAnimationFrame(tick)
    }
    frameId.current = requestAnimationFrame(tick)
  }

  function stop() {
    if (frameId.current) cancelAnimationFrame(frameId.current)
  }

  function reset() {
    stop()
    elapsed.current = 0
    setDisplay(0)
  }
}`

function formatTime(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export default function UseRefDemo() {
  const [display, setDisplay] = useState(0)
  const [running, setRunning] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const elapsed = useRef(0)
  const startTime = useRef<number | null>(null)
  const frameId = useRef<number | null>(null)

  // Track renders (this state update is intentional for the demo)
  const renders = useRef(0)
  renders.current += 1

  function start() {
    if (running) return
    setRunning(true)
    startTime.current = Date.now() - elapsed.current
    let lastRenderUpdate = 0
    function tick() {
      elapsed.current = Date.now() - startTime.current!
      setDisplay(elapsed.current)
      // Throttle the render counter update to avoid flooding
      if (elapsed.current - lastRenderUpdate > 200) {
        lastRenderUpdate = elapsed.current
        setRenderCount(renders.current)
      }
      frameId.current = requestAnimationFrame(tick)
    }
    frameId.current = requestAnimationFrame(tick)
  }

  function stop() {
    if (frameId.current) cancelAnimationFrame(frameId.current)
    setRunning(false)
  }

  function reset() {
    stop()
    elapsed.current = 0
    setDisplay(0)
    setRunning(false)
  }

  useEffect(() => () => { if (frameId.current) cancelAnimationFrame(frameId.current) }, [])

  return (
    <div className="card">
      <div className="card-title">useRef</div>
      <p className="card-desc">
        <code>useRef</code> returns a mutable object (<code>.current</code>) that persists across renders
        without triggering one. Ideal for timers, DOM nodes, and previous-value tracking.
      </p>

      <div className="stopwatch-display">{formatTime(display)}</div>

      <div className="controls">
        <button onClick={start} disabled={running}>▶ Start</button>
        <button className="secondary" onClick={stop} disabled={!running}>⏸ Stop</button>
        <button className="secondary" onClick={reset}>↺ Reset</button>
      </div>

      <div className="demo-output">
        <div className="data-field">
          <span className="field-key">elapsed (ref):</span>
          <span className="field-val" style={{ fontFamily: 'var(--mono)' }}>
            {elapsed.current}ms — stored in <code>useRef</code>, not state
          </span>
        </div>
        <div className="data-field" style={{ marginTop: '0.4rem' }}>
          <span className="field-key">component renders:</span>
          <span className="field-val" style={{ color: 'var(--fire)', fontFamily: 'var(--mono)' }}>
            {renderCount} — only when <code>setDisplay</code> is called
          </span>
        </div>
      </div>

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <><code>useRef(val)</code> returns <code>&#123; current: val &#125;</code> — the same object on every render.</> },
          { text: <>Mutating <code>ref.current</code> does NOT trigger a re-render. Perfect for values you need to read inside callbacks without stale closures.</> },
          { text: <>The interval/frame ID is stored in a ref so the cleanup function can cancel it without needing it in state or deps array.</> },
          { text: <><code>startTime</code> is a ref so the <code>tick</code> callback always reads the latest value, avoiding stale closure bugs.</> },
          { text: <>Only <code>setDisplay</code> triggers re-renders — keeping the UI in sync while the ref does the heavy lifting.</> },
        ]} />
      </CollapsibleCode>
    </div>
  )
}
