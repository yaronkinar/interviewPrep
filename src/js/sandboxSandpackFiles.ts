/** Plain JS helpers bundled into Sandpack (import from `./sandbox-utils.js`). */

export const SANDBOX_UTILS_CODE = `export function memoize(fn, maxSize = Infinity) {
  const cache = new Map()
  const wrapped = (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    if (cache.size >= maxSize) cache.delete(cache.keys().next().value)
    const value = fn(...args)
    cache.set(key, value)
    return value
  }
  wrapped.clear = () => cache.clear()
  return wrapped
}

export function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function throttle(fn, delay) {
  let lastCall = 0
  let timer = null
  return function (...args) {
    const now = Date.now()
    const elapsed = now - lastCall
    const remaining = delay - elapsed
    if (timer) clearTimeout(timer)
    if (remaining <= 0) {
      fn(...args)
      lastCall = Date.now()
      timer = null
    } else {
      timer = setTimeout(() => {
        fn(...args)
        lastCall = Date.now()
        timer = null
      }, remaining)
    }
  }
}
`

export const SANDBOX_INDEX_CODE = `import { memoize, debounce, throttle } from './sandbox-utils.js'

// memoize, debounce, throttle from sandbox-utils.js
// Ctrl+Enter to run (or use the Run button)

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1)
}

for (let i = 1; i <= 8; i++) {
  console.log(\`\${i}! = \${factorial(i)}\`)
}

const memoFact = memoize(factorial)
console.log('memoFact(10):', memoFact(10))
console.log('memoFact(10) again:', memoFact(10))
`
