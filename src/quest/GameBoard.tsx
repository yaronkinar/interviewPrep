import { useEffect, useMemo, useRef, useState } from 'react'
import type { Action, GameState } from './types'
import { buildInitialState } from './GameRunner'
import type { Level } from './types'

const TILE_PX = 36

type Props = {
  level: Level
  /** Sequence of actions to animate, or `null` for static initial state. */
  actions: Action[] | null
  /** Animation speed in ms per frame; defaults to 220. */
  frameMs?: number
  /** Bumped by the parent on every Run press to restart the animation. */
  runKey: number
}

export default function GameBoard({ level, actions, frameMs = 220, runKey }: Props) {
  const initial = useMemo(() => buildInitialState(level), [level])
  const [frame, setFrame] = useState(0)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    setFrame(0)
    if (animRef.current !== null) {
      window.clearTimeout(animRef.current)
      animRef.current = null
    }
    if (!actions || actions.length === 0) return
    let i = 0
    const tick = () => {
      i += 1
      setFrame(i)
      if (i < actions.length) {
        animRef.current = window.setTimeout(tick, frameMs)
      }
    }
    animRef.current = window.setTimeout(tick, frameMs)
    return () => {
      if (animRef.current !== null) window.clearTimeout(animRef.current)
    }
  }, [actions, frameMs, runKey])

  const view = useMemo<GameState>(() => projectFrame(initial, actions, frame), [initial, actions, frame])

  const widthPx = view.width * TILE_PX
  const heightPx = view.height * TILE_PX
  const lastAction = actions && frame > 0 ? actions[frame - 1] : null

  return (
    <div className="quest-board" style={{ width: widthPx, height: heightPx }}>
      <div className="quest-board-grid" style={{ width: widthPx, height: heightPx }}>
        {view.cells.flatMap((row, y) =>
          row.map((cell, x) => {
            const door = Object.values(view.doors).find(d => d.x === x && d.y === y)
            const isOpenDoor = door?.open === true
            const isClosedDoor = door && !door.open
            const className =
              cell === 'wall'
                ? 'quest-cell wall'
                : cell === 'goal'
                ? 'quest-cell goal'
                : cell === 'lock'
                ? 'quest-cell lock'
                : isClosedDoor
                ? 'quest-cell door'
                : isOpenDoor
                ? 'quest-cell door open'
                : 'quest-cell floor'
            return (
              <div
                key={`${x}-${y}`}
                className={className}
                style={{
                  left: x * TILE_PX,
                  top: y * TILE_PX,
                  width: TILE_PX,
                  height: TILE_PX,
                }}
              >
                {cell === 'goal' ? '★' : isClosedDoor ? '▤' : isOpenDoor ? ' ' : null}
              </div>
            )
          })
        )}
        {view.items.map(item => (
          <div
            key={item.id}
            className={`quest-sprite quest-item ${item.kind}`}
            style={{ left: item.x * TILE_PX, top: item.y * TILE_PX, width: TILE_PX, height: TILE_PX }}
          >
            {item.kind === 'gem' ? '◆' : item.kind === 'key' ? '⚿' : item.kind === 'scroll' ? '✺' : '⚱'}
          </div>
        ))}
        {view.enemies.map(enemy => (
          <div
            key={enemy.id}
            className={`quest-sprite quest-enemy ${enemy.kind}`}
            style={{ left: enemy.x * TILE_PX, top: enemy.y * TILE_PX, width: TILE_PX, height: TILE_PX }}
            title={`${enemy.kind} hp:${enemy.hp}`}
          >
            {enemy.kind === 'orc' ? '☠' : enemy.kind === 'goblin' ? '☻' : enemy.kind === 'troll' ? '⛧' : '✺'}
          </div>
        ))}
        <div
          className={`quest-sprite quest-hero face-${view.hero.facing}`}
          style={{
            left: view.hero.pos.x * TILE_PX,
            top: view.hero.pos.y * TILE_PX,
            width: TILE_PX,
            height: TILE_PX,
            transition: `left ${frameMs - 20}ms ease-out, top ${frameMs - 20}ms ease-out`,
          }}
        >
          ⚉
        </div>
        {lastAction?.message ? (
          <div
            className="quest-bubble"
            style={{
              left: view.hero.pos.x * TILE_PX + TILE_PX,
              top: view.hero.pos.y * TILE_PX - 6,
            }}
          >
            {lastAction.message}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function projectFrame(initial: GameState, actions: Action[] | null, frame: number): GameState {
  if (!actions || frame <= 0) return initial
  const action = actions[Math.min(frame, actions.length) - 1]
  return {
    ...initial,
    hero: action.hero,
    enemies: mergeEnemies(initial, action),
    items: mergeItems(initial, action),
    doors: action.doors,
  }
}

function mergeEnemies(initial: GameState, action: Action): GameState['enemies'] {
  return initial.enemies.map(e => {
    const live = action.enemies.find(a => a.id === e.id)
    if (!live) return { ...e, alive: false }
    return { ...e, ...live }
  })
}
function mergeItems(initial: GameState, action: Action): GameState['items'] {
  return initial.items.map(i => {
    const live = action.items.find(a => a.id === i.id)
    if (!live) return { ...i, taken: true }
    return { ...i, ...live }
  })
}
