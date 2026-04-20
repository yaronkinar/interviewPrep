import { QUEST_LEVELS } from './levels'
import type { Level } from './types'

type Props = {
  current: Level
  onSelect: (level: Level) => void
  completedIds: ReadonlyArray<string>
}

export default function LevelPicker({ current, onSelect, completedIds }: Props) {
  const completed = new Set(completedIds)
  return (
    <aside className="quest-picker">
      <h2 className="quest-picker-title">Quests</h2>
      <ol className="quest-picker-list">
        {QUEST_LEVELS.map(level => {
          const done = completed.has(level.id)
          const active = current.id === level.id
          return (
            <li key={level.id}>
              <button
                type="button"
                className={`quest-picker-item${active ? ' active' : ''}${done ? ' done' : ''}`}
                onClick={() => onSelect(level)}
              >
                <span className="quest-picker-num">{level.order}</span>
                <span className="quest-picker-meta">
                  <span className="quest-picker-name">{level.title}</span>
                  <span className="quest-picker-concept">{conceptLabel(level.concept)}</span>
                </span>
                <span className="quest-picker-status" aria-hidden>
                  {done ? '✓' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

function conceptLabel(concept: Level['concept']): string {
  switch (concept) {
    case 'callbacks':
      return 'callbacks'
    case 'arrayMethods':
      return 'array methods'
    case 'closures':
      return 'closures'
    case 'higherOrder':
      return 'higher-order fns'
    case 'thisBinding':
      return '`this` & binding'
    case 'asyncAwait':
      return 'async / await'
    case 'promiseAll':
      return 'Promise.all'
    case 'destructuring':
      return 'destructuring + spread'
  }
}
