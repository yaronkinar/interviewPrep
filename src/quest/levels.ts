import { checkConcept, RULES } from './conceptCheck'
import type { Level } from './types'

/**
 * Layout characters:
 *  '.'  floor
 *  '#'  wall
 *  'S'  hero spawn (rendered as floor)
 *  'G'  goal tile
 *  'D'  door tile (rendered as floor only when open)
 *  'L'  lock indicator (decorative)
 */

const LEVELS: Level[] = [
  // ---------- 1. callbacks / arrow functions ----------
  {
    id: 'arrow-march',
    order: 1,
    title: 'The Arrow March',
    concept: 'callbacks',
    objective: 'Walk the hero east to the goal using `forEach` and an arrow function.',
    brief:
      'Arrow functions (`x => x + 1`) are concise callbacks. Use `forEach` over a list of directions and an arrow callback to move the hero one tile at a time.',
    hint: "Try: ['east','east','east','east'].forEach(dir => hero.move(dir))",
    layout: [
      '########',
      '#S....G#',
      '########',
    ],
    starterCode: `// Walk east 4 tiles using forEach + arrow function.
// hero.move(dir) where dir is 'north' | 'south' | 'east' | 'west'.

;[].forEach((dir) => hero.move(dir))
`,
    requireConcept: src => checkConcept(src, [RULES.arrowFunction]),
    winCheck: state => state.won,
  },

  // ---------- 2. array methods ----------
  {
    id: 'orcs-only',
    order: 2,
    title: 'Orcs Only',
    concept: 'arrayMethods',
    objective: 'Defeat every orc but spare the goblins. Use `.filter` and `.forEach`.',
    brief:
      'Array methods like `filter`, `map`, and `forEach` express intent declaratively. `enemies` is provided as a global — pick the orcs and attack each one.',
    hint: 'enemies.filter(e => e.type === "orc").forEach(o => hero.attack(o))',
    layout: [
      '##########',
      '#S.......#',
      '#........#',
      '##########',
    ],
    enemies: [
      { kind: 'orc', x: 4, y: 1, hp: 1 },
      { kind: 'goblin', x: 5, y: 1, hp: 1 },
      { kind: 'orc', x: 6, y: 1, hp: 1 },
      { kind: 'goblin', x: 4, y: 2, hp: 1 },
      { kind: 'orc', x: 7, y: 2, hp: 1 },
    ],
    starterCode: `// Defeat every orc — leave the goblins alone.
// 'enemies' is an array snapshot of the foes on the map.
// Each enemy has { id, type, x, y, hp }.

`,
    requireConcept: src =>
      checkConcept(src, [
        RULES.arrayMethod,
        {
          kind: 'forbid',
          pattern: /goblin/,
          message: "Don't reference 'goblin' explicitly — filter for orcs instead.",
        },
      ]),
    winCheck: state =>
      state.enemies.filter(e => e.type === 'orc').every(e => !e.alive) &&
      state.enemies.filter(e => e.type === 'goblin').every(e => e.alive),
  },

  // ---------- 3. closures ----------
  {
    id: 'gate-of-three',
    order: 3,
    title: 'The Gate of Three',
    concept: 'closures',
    objective:
      "Write a `makeCounter()` closure. Call it 3 times to ring the gate's bell, then walk through to the goal.",
    brief:
      'A closure traps state inside a returned function. Build `makeCounter()` so each call returns the next integer; ring `hero.cast("bell")` until the count hits 3; the gate opens.',
    hint: 'function makeCounter() { let n = 0; return () => ++n }',
    layout: [
      '##########',
      '#S..D...G#',
      '##########',
    ],
    doors: [{ id: 'bell', x: 4, y: 1 }],
    starterCode: `// Define makeCounter — a closure factory.
// Ring the bell (hero.cast("bell")) until the counter returns 3,
// then walk east to the goal.

function makeCounter() {
  // your closure here
}

const next = makeCounter()
// while (next() < 3) hero.cast("bell")

// then walk east
`,
    requireConcept: src => checkConcept(src, [RULES.closure]),
    winCheck: state => {
      const castCount = (state.meta.castCount as number | undefined) ?? 0
      return state.won && castCount >= 3
    },
  },

  // ---------- 4. higher-order functions ----------
  {
    id: 'rusty-lock',
    order: 4,
    title: 'The Rusty Lock',
    concept: 'higherOrder',
    objective:
      'Implement `withRetry(fn, n)` that calls `fn` up to `n` times until it returns `true`. Use it on `hero.pickLock` to open the door.',
    brief:
      'A higher-order function takes a function as input. Wrap an unreliable action in a retry helper — your tool, applied to many problems.',
    hint:
      'function withRetry(fn, n) { for (let i = 0; i < n; i++) { if (fn()) return true } return false }',
    layout: [
      '##########',
      '#S..L.D.G#',
      '##########',
    ],
    doors: [{ id: 'rusty', x: 6, y: 1 }],
    starterCode: `// hero.pickLock() succeeds randomly. Wrap it in withRetry.
// Then walk east to the goal — the door will already be open.

function withRetry(fn, n) {
  // call fn() up to n times; return true on first success, false otherwise
}

// withRetry(() => hero.pickLock(), 10)
// then walk east
`,
    requireConcept: src => checkConcept(src, [RULES.higherOrder]),
    winCheck: state => state.won,
  },

  // ---------- 5. `this` & binding ----------
  {
    id: 'bound-spell',
    order: 5,
    title: 'The Unbound Spell',
    concept: 'thisBinding',
    objective:
      'A `Spell` object loses its `this` when passed as a callback. Bind it correctly so casting the spell records the right power.',
    brief:
      'When you pass a method as a callback, the receiver is lost — `this` is `undefined` in strict mode. Use `.bind(spell)` or wrap in an arrow function to preserve it.',
    hint:
      "Pass `spell.cast.bind(spell)` to runLater — or wrap as `() => spell.cast()` so the inner `this` stays intact.",
    layout: [
      '########',
      '#S....G#',
      '########',
    ],
    starterCode: `// Fix the broken call so casting records 'fire' (not crashes on undefined this).
// Then walk east to the goal.

const spell = {
  power: 'fire',
  cast() {
    // 'this' must be the spell when this runs
    hero.cast(this.power)
  },
}

const runLater = (fn) => fn()
runLater(spell.cast) // BROKEN — this is undefined

// then walk east
`,
    requireConcept: src => checkConcept(src, [RULES.bind]),
    winCheck: state => state.won && state.meta.lastSpell === 'fire',
  },

  // ---------- 6. async/await ----------
  {
    id: 'timed-gate',
    order: 6,
    title: 'The Timed Gate',
    concept: 'asyncAwait',
    objective:
      'The gate opens 300ms after you arrive. Use `await hero.wait(...)` and `await hero.moveAsync(...)` to cross.',
    brief:
      '`async` functions let you `await` promises and write asynchronous code top-to-bottom. Every `hero.*Async` returns a promise — await it.',
    hint: 'await hero.wait(300); await hero.moveAsync("east")',
    layout: [
      '########',
      '#S..D.G#',
      '########',
    ],
    doors: [{ id: 'timed', x: 4, y: 1, openAfterMs: 300 }],
    starterCode: `// The door at column 4 opens 300ms after you start.
// await hero.wait(300) advances the simulated clock.
// await hero.moveAsync('east') moves one tile.

`,
    requireConcept: src => checkConcept(src, [RULES.asyncAwait]),
    winCheck: state => state.won,
  },

  // ---------- 7. Promise.all ----------
  {
    id: 'two-paths',
    order: 7,
    title: 'Two Paths',
    concept: 'promiseAll',
    objective:
      'Use `Promise.all` to scout north and south at the same time, then walk through whichever neighbour was floor.',
    brief:
      '`Promise.all([a, b])` runs promises concurrently and waits for both. Use it to peek in two directions in one go.',
    hint:
      'const [n, s] = await Promise.all([hero.scoutAsync("north"), hero.scoutAsync("south")])',
    layout: [
      '########',
      '########',
      '#S....G#',
      '########',
      '########',
    ],
    starterCode: `// Scout north and south in parallel with Promise.all.
// One direction is wall, the other is floor — pick the floor and walk east.

`,
    requireConcept: src => checkConcept(src, [RULES.promiseAll, RULES.asyncAwait]),
    winCheck: state => state.won,
  },

  // ---------- 8. destructuring & spread ----------
  {
    id: 'craft-and-go',
    order: 8,
    title: 'Craft & Go',
    concept: 'destructuring',
    objective:
      'Pick up the gem and the scroll, destructure `{ x, y }` from `hero.pos`, then craft using spread to forge a potion that opens the gate.',
    brief:
      'Destructuring (`const { x, y } = obj`) and spread (`fn(...arr)`) are everyday JS. Combine them to read positions and forward inventory ids in one expression.',
    hint:
      'hero.craft(...hero.inventory.map(i => i.id))',
    layout: [
      '###########',
      '#S.......G#',
      '###########',
    ],
    items: [
      { kind: 'gem', x: 3, y: 1 },
      { kind: 'scroll', x: 4, y: 1 },
    ],
    doors: [{ id: 'forge', x: 6, y: 1 }],
    starterCode: `// Walk over the gem and the scroll, collecting each with hero.collect().
// Then destructure { x, y } from hero.pos to log your location,
// and craft a potion using spread on the inventory ids.

// const { x, y } = hero.pos
// hero.craft(...hero.inventory.map(i => i.id))
`,
    requireConcept: src => checkConcept(src, [RULES.destructuring, RULES.spread]),
    winCheck: state => {
      const crafted = (state.meta.crafted as unknown[] | undefined) ?? []
      return state.won && crafted.length > 0
    },
  },
]

export const QUEST_LEVELS: ReadonlyArray<Level> = LEVELS

export function getLevelById(id: string): Level | undefined {
  return QUEST_LEVELS.find(l => l.id === id)
}
