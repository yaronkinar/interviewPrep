import { createHeroApi, type HeroContext } from './heroApi'
import type { Action, CellKind, Enemy, GameState, Item, Level, RunResult } from './types'

const STEP_LIMIT = 800
const WALL_CLOCK_BUDGET_MS = 5000

const CELL_FROM_CHAR: Record<string, CellKind> = {
  '.': 'floor',
  ' ': 'floor',
  S: 'floor',
  G: 'goal',
  '#': 'wall',
  D: 'floor',
  L: 'lock',
}

/** Simple seedable mulberry32 RNG so puzzles are deterministic per run. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function buildInitialState(level: Level): GameState {
  const rows = level.layout
  const height = rows.length
  const width = Math.max(...rows.map(r => r.length))
  const cells: CellKind[][] = []
  let spawn = { x: 0, y: 0 }
  for (let y = 0; y < height; y++) {
    cells.push([])
    for (let x = 0; x < width; x++) {
      const ch = rows[y]?.[x] ?? '#'
      cells[y][x] = CELL_FROM_CHAR[ch] ?? 'floor'
      if (ch === 'S') spawn = { x, y }
    }
  }
  const enemies: Enemy[] = (level.enemies ?? []).map((e, i) => ({
    id: `enemy-${i}`,
    kind: e.kind,
    type: e.kind,
    x: e.x,
    y: e.y,
    hp: e.hp ?? 1,
    alive: true,
  }))
  const items: Item[] = (level.items ?? []).map((it, i) => ({
    id: `item-${i}`,
    kind: it.kind,
    x: it.x,
    y: it.y,
    taken: false,
  }))
  const doors: GameState['doors'] = {}
  ;(level.doors ?? []).forEach(d => {
    doors[d.id] = { x: d.x, y: d.y, open: false, timeOpenMs: d.openAfterMs }
  })
  return {
    width,
    height,
    cells,
    hero: {
      pos: spawn,
      hp: 5,
      clock: 0,
      inventory: [],
      facing: 'east',
      dead: false,
      log: [],
    },
    enemies,
    items,
    doors,
    won: false,
    clock: 0,
    meta: {},
    step: 0,
  }
}

export type RunOptions = {
  /** Seed for deterministic RNG (defaults to a fixed value per run). */
  seed?: number
}

export async function runCode(code: string, level: Level, opts: RunOptions = {}): Promise<RunResult> {
  const state = buildInitialState(level)
  const ctx: HeroContext = {
    state,
    actions: [],
    pendingTurnCb: null,
    stepLimit: STEP_LIMIT,
    rng: mulberry32(opts.seed ?? 1234),
  }
  const hero = createHeroApi(ctx)
  // Provide level-aware globals.
  const enemies = state.enemies.map(e => ({ ...e }))
  const items = state.items.map(i => ({ ...i }))
  const start = Date.now()

  const consoleLog: string[] = []
  const sandboxConsole = {
    log: (...args: unknown[]) => consoleLog.push(args.map(stringify).join(' ')),
    warn: (...args: unknown[]) => consoleLog.push('[warn] ' + args.map(stringify).join(' ')),
    error: (...args: unknown[]) => consoleLog.push('[error] ' + args.map(stringify).join(' ')),
    info: (...args: unknown[]) => consoleLog.push(args.map(stringify).join(' ')),
  }

  try {
    const fn = new Function(
      'hero',
      'enemies',
      'items',
      'console',
      `"use strict";\nreturn (async () => { ${code}\n })();`
    )
    const promise = fn(hero, enemies, items, sandboxConsole) as Promise<unknown>
    await Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timed out — your code took too long.')), WALL_CLOCK_BUDGET_MS)
      ),
    ])
    // Drain a single onTurn callback if the level uses it.
    if (ctx.pendingTurnCb && state.step < ctx.stepLimit) {
      try {
        ctx.pendingTurnCb(hero)
      } catch (e) {
        return { status: 'error', error: errString(e), actions: ctx.actions }
      }
    }
    if (state.step >= ctx.stepLimit) {
      return {
        status: 'timeout',
        error: `Action limit reached (${ctx.stepLimit}). Use array methods or loops more tightly.`,
        actions: ctx.actions,
      }
    }
    if (Date.now() - start > WALL_CLOCK_BUDGET_MS) {
      return { status: 'timeout', error: 'Time limit reached.', actions: ctx.actions }
    }
    state.hero.log.push(...consoleLog)
    return {
      status: 'ok',
      won: level.winCheck(state),
      actions: ctx.actions,
      finalState: state,
    }
  } catch (e) {
    return { status: 'error', error: errString(e), actions: ctx.actions }
  }
}

function stringify(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function errString(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`
  return String(e)
}

/** Re-export for tests / preview. */
export type { Action }
