import { useState } from 'react'
import type { Level, RunResult } from './types'

type Props = {
  level: Level
  result: RunResult | null
  conceptError: string | null
  /** Fired by the page when the run produces a winning state. */
  isCompleted: boolean
}

export default function ObjectivePanel({ level, result, conceptError, isCompleted }: Props) {
  const [showHint, setShowHint] = useState(false)

  return (
    <aside className="quest-objective">
      <header className="quest-objective-header">
        <h2 className="quest-objective-title">
          <span className="quest-objective-num">Quest {level.order}</span>
          {level.title}
        </h2>
        <p className="quest-objective-goal">{level.objective}</p>
      </header>

      <section className="quest-objective-brief">
        <p>{level.brief}</p>
      </section>

      <section className="quest-objective-controls">
        <button type="button" className="secondary" onClick={() => setShowHint(s => !s)}>
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
        {showHint ? (
          <pre className="quest-objective-hint">
            <code>{level.hint}</code>
          </pre>
        ) : null}
      </section>

      <section className="quest-objective-status" aria-live="polite">
        {result === null ? (
          <p className="quest-status-idle">Press Run to execute your code.</p>
        ) : result.status === 'error' ? (
          <p className="quest-status-error">Error: {result.error}</p>
        ) : result.status === 'timeout' ? (
          <p className="quest-status-error">{result.error}</p>
        ) : conceptError ? (
          <p className="quest-status-warn">Concept check failed — {conceptError}</p>
        ) : isCompleted ? (
          <p className="quest-status-win">Quest complete!</p>
        ) : result.won ? (
          <p className="quest-status-win">Reached the goal!</p>
        ) : (
          <p className="quest-status-fail">Not yet — the win condition is not met.</p>
        )}
      </section>
    </aside>
  )
}
