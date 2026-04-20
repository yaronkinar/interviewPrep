import type { Action, Direction, Enemy, GameState, Item } from './types'

export type HeroApi = {
  /** Current hero position. Read-only snapshot — mutating it does nothing. */
  readonly pos: { x: number; y: number }
  /** Current HP. */
  readonly hp: number
  /** Read-only inventory snapshot. */
  readonly inventory: ReadonlyArray<Item>
  /** Synchronously walk one tile in `dir`. Walls block. */
  move: (dir: Direction) => boolean
  /** Strike an enemy (by reference or by id). One hit per call. */
  attack: (target: Enemy | string) => void
  /** Pick up the item on the current tile, if any. */
  collect: () => Item | null
  /** Idle for `ms` simulated milliseconds. Used for timed puzzles. */
  wait: (ms: number) => void
  /** Print a speech-bubble message. */
  say: (msg: string) => void
  /** Look at the 4 neighbouring tiles — returns enemies/items there. */
  scan: () => { enemies: Enemy[]; items: Item[] }
  /** Attempt to pick a lock — succeeds randomly (uses a seeded RNG). */
  pickLock: () => boolean
  /** Run a callback on the next "turn" — feeds the callbacks lesson. */
  onTurn: (cb: (api: HeroApi) => void) => void
  /** Async variant of move — resolves after the action animates. */
  moveAsync: (dir: Direction) => Promise<boolean>
  /** Scout a direction and return what you would walk into without moving. */
  scout: (dir: Direction) => 'wall' | 'floor' | 'goal' | 'door' | 'lock' | 'enemy' | 'item'
  /** Async variant — useful with Promise.all to scout multiple directions in parallel. */
  scoutAsync: (dir: Direction) => Promise<'wall' | 'floor' | 'goal' | 'door' | 'lock' | 'enemy' | 'item'>
  /** Cast a bound method — used in the `this` lesson. */
  cast: (spellName: string) => void
  /** Combine items in inventory by id — used in destructuring/spread lesson. */
  craft: (...itemIds: string[]) => Item | null
}

const DIR_VEC: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 },
  west: { dx: -1, dy: 0 },
}

/** Mutable closure that the runner uses while draining actions. */
export type HeroContext = {
  state: GameState
  actions: Action[]
  pendingTurnCb: ((api: HeroApi) => void) | null
  /** Cap on actions per run — runner enforces, this just signals to stop. */
  stepLimit: number
  /** Deterministic RNG for puzzles such as `pickLock`. */
  rng: () => number
}

function snapshotEnemies(state: GameState): Enemy[] {
  return state.enemies.filter(e => e.alive).map(e => ({ ...e }))
}
function snapshotItems(state: GameState): Item[] {
  return state.items.filter(i => !i.taken).map(i => ({ ...i }))
}
function snapshotHero(state: GameState) {
  return { ...state.hero, pos: { ...state.hero.pos }, inventory: state.hero.inventory.map(i => ({ ...i })) }
}
function snapshotDoors(state: GameState) {
  return Object.fromEntries(Object.entries(state.doors).map(([k, v]) => [k, { ...v }]))
}

function pushAction(ctx: HeroContext, partial: Pick<Action, 'kind'> & Partial<Omit<Action, 'kind'>>): Action {
  const action: Action = {
    kind: partial.kind,
    hero: snapshotHero(ctx.state),
    enemies: snapshotEnemies(ctx.state),
    items: snapshotItems(ctx.state),
    doors: snapshotDoors(ctx.state),
    message: partial.message,
    blocked: partial.blocked,
  }
  ctx.actions.push(action)
  ctx.state.step += 1
  return action
}

function tileAt(state: GameState, x: number, y: number): string {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) return '#'
  if (state.enemies.some(e => e.alive && e.x === x && e.y === y)) return 'E'
  const door = Object.values(state.doors).find(d => d.x === x && d.y === y)
  if (door && !door.open) return 'D'
  if (state.items.some(i => !i.taken && i.x === x && i.y === y)) return 'I'
  const cell = state.cells[y]?.[x]
  if (!cell) return '#'
  if (cell === 'wall') return '#'
  if (cell === 'goal') return 'G'
  if (cell === 'lock') return 'L'
  return '.'
}

function isOpenForWalking(state: GameState, x: number, y: number): boolean {
  const t = tileAt(state, x, y)
  return t === '.' || t === 'G' || t === 'I' || t === 'L'
}

function tickTimedDoors(state: GameState): void {
  Object.values(state.doors).forEach(d => {
    if (typeof d.timeOpenMs === 'number' && state.clock >= d.timeOpenMs) d.open = true
  })
}

export function createHeroApi(ctx: HeroContext): HeroApi {
  const api: HeroApi = {
    get pos() {
      return { ...ctx.state.hero.pos }
    },
    get hp() {
      return ctx.state.hero.hp
    },
    get inventory() {
      return ctx.state.hero.inventory.map(i => ({ ...i }))
    },

    move(dir) {
      if (ctx.state.step >= ctx.stepLimit || ctx.state.hero.dead) return false
      const { dx, dy } = DIR_VEC[dir]
      ctx.state.hero.facing = dir
      tickTimedDoors(ctx.state)
      const nx = ctx.state.hero.pos.x + dx
      const ny = ctx.state.hero.pos.y + dy
      if (!isOpenForWalking(ctx.state, nx, ny)) {
        pushAction(ctx, { kind: 'move', blocked: true, message: `blocked moving ${dir}` })
        return false
      }
      ctx.state.hero.pos = { x: nx, y: ny }
      ctx.state.clock += 100
      ctx.state.hero.clock = ctx.state.clock
      tickTimedDoors(ctx.state)
      const cell = ctx.state.cells[ny]?.[nx]
      if (cell === 'goal') ctx.state.won = true
      pushAction(ctx, { kind: 'move' })
      ctx.state.hero.log.push(`moved ${dir} -> ${nx},${ny}`)
      return true
    },

    attack(target) {
      if (ctx.state.step >= ctx.stepLimit || ctx.state.hero.dead) return
      const id = typeof target === 'string' ? target : target.id
      const enemy = ctx.state.enemies.find(e => e.id === id && e.alive)
      if (!enemy) {
        pushAction(ctx, { kind: 'attack', blocked: true, message: 'no such enemy' })
        return
      }
      enemy.hp -= 1
      if (enemy.hp <= 0) enemy.alive = false
      ctx.state.clock += 100
      pushAction(ctx, { kind: 'attack', message: `hit ${enemy.kind}` })
    },

    collect() {
      if (ctx.state.step >= ctx.stepLimit || ctx.state.hero.dead) return null
      const here = ctx.state.items.find(
        i => !i.taken && i.x === ctx.state.hero.pos.x && i.y === ctx.state.hero.pos.y
      )
      if (!here) {
        pushAction(ctx, { kind: 'collect', blocked: true, message: 'nothing to collect' })
        return null
      }
      here.taken = true
      ctx.state.hero.inventory.push({ ...here })
      ctx.state.clock += 50
      pushAction(ctx, { kind: 'collect', message: `picked up ${here.kind}` })
      return { ...here }
    },

    wait(ms) {
      if (ctx.state.step >= ctx.stepLimit) return
      ctx.state.clock += Math.max(0, Math.floor(ms))
      ctx.state.hero.clock = ctx.state.clock
      tickTimedDoors(ctx.state)
      pushAction(ctx, { kind: 'wait', message: `waited ${ms}ms` })
    },

    say(msg) {
      pushAction(ctx, { kind: 'say', message: msg })
    },

    scan() {
      pushAction(ctx, { kind: 'scan' })
      const neighbours = (Object.keys(DIR_VEC) as Direction[]).flatMap(d => {
        const { dx, dy } = DIR_VEC[d]
        const x = ctx.state.hero.pos.x + dx
        const y = ctx.state.hero.pos.y + dy
        return [{ x, y }]
      })
      const enemies = neighbours
        .map(({ x, y }) => ctx.state.enemies.find(e => e.alive && e.x === x && e.y === y))
        .filter((e): e is Enemy => Boolean(e))
        .map(e => ({ ...e }))
      const items = neighbours
        .map(({ x, y }) => ctx.state.items.find(i => !i.taken && i.x === x && i.y === y))
        .filter((i): i is Item => Boolean(i))
        .map(i => ({ ...i }))
      return { enemies, items }
    },

    pickLock() {
      const success = ctx.rng() > 0.55
      const meta = ctx.state.meta
      meta.lockAttempts = ((meta.lockAttempts as number | undefined) ?? 0) + 1
      if (success) {
        meta.lockOpen = true
        Object.values(ctx.state.doors).forEach(d => {
          d.open = true
        })
      }
      ctx.state.clock += 200
      pushAction(ctx, {
        kind: 'pickLock',
        message: success ? 'lock opened' : 'lock jammed',
        blocked: !success,
      })
      return success
    },

    onTurn(cb) {
      ctx.pendingTurnCb = cb
    },

    moveAsync(dir) {
      const ok = api.move(dir)
      return Promise.resolve(ok)
    },

    scout(dir) {
      const { dx, dy } = DIR_VEC[dir]
      const x = ctx.state.hero.pos.x + dx
      const y = ctx.state.hero.pos.y + dy
      const t = tileAt(ctx.state, x, y)
      if (t === '#') return 'wall'
      if (t === 'G') return 'goal'
      if (t === 'D') return 'door'
      if (t === 'L') return 'lock'
      if (t === 'E') return 'enemy'
      if (t === 'I') return 'item'
      return 'floor'
    },

    scoutAsync(dir) {
      pushAction(ctx, { kind: 'scout', message: `scout ${dir}` })
      return Promise.resolve(api.scout(dir))
    },

    cast(spellName) {
      const meta = ctx.state.meta
      meta.lastSpell = spellName
      meta.castCount = ((meta.castCount as number | undefined) ?? 0) + 1
      // Track named-cast tallies so puzzles can react to e.g. 3 bell rings.
      const tally = (meta.castTally as Record<string, number> | undefined) ?? {}
      tally[spellName] = (tally[spellName] ?? 0) + 1
      meta.castTally = tally
      // If a door shares the spell name and the tally hit 3, open it.
      const door = ctx.state.doors[spellName]
      if (door && tally[spellName] >= 3) door.open = true
      ctx.state.clock += 50
      pushAction(ctx, { kind: 'cast', message: `cast ${spellName}` })
    },

    craft(...itemIds) {
      const taken = itemIds
        .map(id => ctx.state.hero.inventory.find(i => i.id === id))
        .filter((i): i is Item => Boolean(i))
      if (!taken.length) {
        pushAction(ctx, { kind: 'craft', blocked: true, message: 'no matching items' })
        return null
      }
      const meta = ctx.state.meta
      meta.crafted = (meta.crafted as Item[] | undefined) ?? []
      const result: Item = {
        id: `crafted-${(meta.crafted as Item[]).length + 1}`,
        kind: 'potion',
        x: ctx.state.hero.pos.x,
        y: ctx.state.hero.pos.y,
        taken: true,
      }
      ;(meta.crafted as Item[]).push(result)
      ctx.state.hero.inventory.push(result)
      // A successful craft fires up the forge: open any door named 'forge'.
      if (ctx.state.doors.forge) ctx.state.doors.forge.open = true
      pushAction(ctx, { kind: 'craft', message: `crafted from ${itemIds.join('+')}` })
      return result
    },
  }
  return api
}
