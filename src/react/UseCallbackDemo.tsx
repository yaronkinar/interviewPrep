import { useState, useCallback, memo } from 'react'
import { useRenderCount } from './hooks'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const IMPL = `// Without useCallback — new fn reference on every render
function Parent() {
  const [count, setCount] = useState(0)
  const handleClick = () => console.log('clicked')  // recreated each render
  return <Child onClick={handleClick} />
}

// With useCallback — stable reference across renders
function Parent() {
  const [count, setCount] = useState(0)
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])  // empty deps = created once
  return <Child onClick={handleClick} />
}

// Child must be wrapped in React.memo to benefit
const Child = memo(({ onClick }) => {
  return <button onClick={onClick}>Click me</button>
})`

// Child component wrapped in memo — only re-renders if props change
const StableChild = memo(function StableChild({ onClick }: { onClick: () => void }) {
  const renders = useRenderCount()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button onClick={onClick}>Click me</button>
      <div className="render-badge">
        <span className="label">renders:</span>
        <span className="count">{renders}</span>
      </div>
    </div>
  )
})

const UnstableChild = memo(function UnstableChild({ onClick }: { onClick: () => void }) {
  const renders = useRenderCount()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <button onClick={onClick}>Click me</button>
      <div className="render-badge">
        <span className="label">renders:</span>
        <span className="count">{renders}</span>
      </div>
    </div>
  )
})

export default function UseCallbackDemo() {
  const [count, setCount] = useState(0)
  const parentRenders = useRenderCount()

  // Stable — same reference across renders
  const stableHandler = useCallback(() => {
    console.log('stable handler fired')
  }, [])

  // Unstable — new reference every render
  const unstableHandler = () => {
    console.log('unstable handler fired')
  }

  return (
    <div className="card">
      <div className="card-title">useCallback + memo</div>
      <p className="card-desc">
        <code>useCallback</code> memoizes a function reference. Combined with <code>React.memo</code>,
        it prevents child re-renders when only unrelated parent state changes.
      </p>

      <div className="controls">
        <button onClick={() => setCount(c => c + 1)}>
          Increment parent counter: {count}
        </button>
      </div>

      <div className="demo-output">
        <div className="render-badge" style={{ marginBottom: '0.75rem' }}>
          <span className="label">Parent renders:</span>
          <span className="count">{parentRenders}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--hit)', fontFamily: 'var(--mono)' }}>
            ✓ useCallback — stable reference
          </div>
          <StableChild onClick={stableHandler} />

          <div style={{ fontSize: '0.78rem', color: 'var(--miss)', fontFamily: 'var(--mono)', marginTop: '0.25rem' }}>
            ✗ no useCallback — new reference each render
          </div>
          <UnstableChild onClick={unstableHandler} />
        </div>
      </div>

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <>Every re-render normally creates a new function object — even if the function body is identical.</> },
          { text: <><code>useCallback(fn, deps)</code> returns the same function reference until a dependency changes.</> },
          { text: <><code>React.memo</code> wraps a component so it only re-renders when its props change (shallow compare).</> },
          { text: <>Together: stable handler → <code>memo</code> sees no prop change → child skips the render.</> },
          { text: <>Without <code>useCallback</code>, <code>memo</code> still sees a new function reference each time → renders anyway.</> },
        ]} />
      </CollapsibleCode>
    </div>
  )
}
