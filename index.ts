import { memoize } from './questions/memoize'
import { debounce } from './questions/debounce'
import { throttle } from './questions/throttle'
import { runIntersectionObserverDemo } from './questions/intersectionObserver'

// ── MEMOIZE ────────────────────────────────────────────────────
console.log('=== MEMOIZE ===')

function slowAdd(a: number, b: number): number {
    console.log(`  computing ${a} + ${b}...`)
    return a + b
}

const memoAdd = memoize(slowAdd)
memoAdd(2, 3)   // computes
memoAdd(2, 3)   // from cache
memoAdd(4, 5)   // computes
memoAdd(4, 5)   // from cache

// ── DEBOUNCE ───────────────────────────────────────────────────
console.log('\n=== DEBOUNCE ===')
console.log('Calling debounced fn 3 times rapidly — only last fires after 300ms')

const debouncedLog = debounce((val: string) => console.log(`  fired: ${val}`), 300)

debouncedLog('a')   // cancelled
debouncedLog('b')   // cancelled
debouncedLog('c')   // fires after 300ms

// ── THROTTLE ──────────────────────────────────────────────────
console.log('\n=== THROTTLE ===')
console.log('Calling throttled fn every 100ms with limit 300ms')

const throttledLog = throttle((val: number) => console.log(`  fired: ${val}`), 300)

let count = 1
const interval = setInterval(() => {
    throttledLog(count++)
    if (count > 7) {
        clearInterval(interval)
    }
}, 100)

// ── OBSERVERS ─────────────────────────────────────────────────
console.log('\n=== OBSERVERS ===')
runIntersectionObserverDemo()
