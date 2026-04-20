export type Direction = 'north' | 'south' | 'east' | 'west'

/** A single grid cell. Authoring uses single-character codes; runtime uses the parsed shape. */
export type CellKind = 'floor' | 'wall' | 'goal' | 'spawn' | 'door' | 'lock'

export type EnemyKind = 'orc' | 'goblin' | 'troll' | 'bat'

export type Enemy = {
  id: string
  kind: EnemyKind
  x: number
  y: number
  hp: number
  /** Some levels label foes for filtering puzzles ("orc" / "goblin"). */
  type: EnemyKind
  alive: boolean
}

export type Item = {
  id: string
  kind: 'gem' | 'key' | 'potion' | 'scroll'
  x: number
  y: number
  taken: boolean
}

export type HeroPos = { x: number; y: number }

export type HeroState = {
  pos: HeroPos
  hp: number
  /** ms accumulator used by async levels (e.g. timed gates). */
  clock: number
  inventory: Item[]
  /** Most-recent direction the hero faced — drives sprite rotation. */
  facing: Direction
  /** True once an action killed the hero (out of HP, walked into trap, etc.). */
  dead: boolean
  log: string[]
}

export type GameState = {
  width: number
  height: number
  cells: CellKind[][]
  hero: HeroState
  enemies: Enemy[]
  items: Item[]
  /** When true, the level's win predicate is satisfied. */
  won: boolean
  /** Simulated milliseconds since the run started — drives timed doors. */
  clock: number
  /** Optional door state map keyed by id, supports timed/keyed doors. */
  doors: Record<string, { x: number; y: number; open: boolean; timeOpenMs?: number }>
  /** Free-form per-level scratch space (e.g. visit counters, locks attempted). */
  meta: Record<string, unknown>
  /** Step counter — bumped per emitted action; capped by the runner. */
  step: number
}

export type ActionKind =
  | 'move'
  | 'attack'
  | 'collect'
  | 'wait'
  | 'say'
  | 'scan'
  | 'pickLock'
  | 'cast'
  | 'craft'
  | 'scout'

export type Action = {
  kind: ActionKind
  /** Snapshot of the hero after applying the action — used by the animator. */
  hero: HeroState
  /** Snapshot of the (alive) enemies after the action. */
  enemies: Enemy[]
  /** Snapshot of remaining (un-taken) items after the action. */
  items: Item[]
  /** Snapshot of door states. */
  doors: GameState['doors']
  /** Optional speech bubble or status string. */
  message?: string
  /** Whether this action was a no-op due to a wall, dead enemy, etc. */
  blocked?: boolean
}

export type LevelConcept =
  | 'callbacks'
  | 'arrayMethods'
  | 'closures'
  | 'higherOrder'
  | 'thisBinding'
  | 'asyncAwait'
  | 'promiseAll'
  | 'destructuring'

export type Level = {
  id: string
  /** Display order — also used for localStorage progress comparison. */
  order: number
  title: string
  concept: LevelConcept
  /** One-line goal shown in the objective panel. */
  objective: string
  /** Markdown-friendly multiline explanation of the JS concept. */
  brief: string
  /** Hint disclosed on demand. */
  hint: string
  /**
   * Grid layout — each character maps to a CellKind:
   *  '.' floor, '#' wall, 'G' goal, 'S' spawn, 'D' door, 'L' lock.
   */
  layout: string[]
  /** Enemies placed at level start. */
  enemies?: Array<{ kind: EnemyKind; x: number; y: number; hp?: number }>
  /** Items placed at level start. */
  items?: Array<{ kind: Item['kind']; x: number; y: number }>
  /** Doors with optional timed-open behavior (ms). */
  doors?: Array<{ id: string; x: number; y: number; openAfterMs?: number }>
  /** Code shown in the editor when the level loads. */
  starterCode: string
  /**
   * Regex/source predicate enforcing the JS construct.
   * Receives the raw user code and returns `null` if OK, otherwise an error message.
   */
  requireConcept?: (source: string) => string | null
  /** Win predicate evaluated after the run finishes. */
  winCheck: (state: GameState) => boolean
}

export type RunResult =
  | { status: 'ok'; won: boolean; actions: Action[]; finalState: GameState; conceptError?: string }
  | { status: 'error'; error: string; actions: Action[] }
  | { status: 'timeout'; error: string; actions: Action[] }
