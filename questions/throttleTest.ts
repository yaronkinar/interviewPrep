/**
 * Explanation:
 * This file tests throttle behavior deterministically by mocking `Date.now`,
 * then compares leading throttle with a trailing variant.
 *
 * Interview Thinking Process:
 * 1) Remove timing flakiness with deterministic clock mocking.
 * 2) Verify core rule: at most one call per interval window.
 * 3) Assert argument forwarding for executed calls.
 * 4) Compare leading vs trailing semantics explicitly.
 * 5) Keep assertions small and descriptive for debugging clarity.
 */
import { throttle } from './throttle'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function withMockedNow<T>(times: number[], run: () => T): T {
  const originalNow = Date.now
  let idx = 0

  Date.now = () => {
    const value = times[Math.min(idx, times.length - 1)]
    idx += 1
    return value
  }

  try {
    return run()
  } finally {
    Date.now = originalNow
  }
}

function testThrottleBasicBehavior(): void {
  const calls: string[] = []

  withMockedNow([0, 30, 99, 100, 180, 220], () => {
    const fn = (value: string) => calls.push(value)
    const throttled = throttle(fn, 100)

    throttled('a') // 0 -> runs
    throttled('b') // 30 -> blocked
    throttled('c') // 99 -> blocked
    throttled('d') // 100 -> runs
    throttled('e') // 180 -> blocked
    throttled('f') // 220 -> runs
  })

  assert(calls.length === 3, 'expected 3 executions')
  assert(calls[0] === 'a', 'first call should execute immediately')
  assert(calls[1] === 'd', 'call at boundary should execute')
  assert(calls[2] === 'f', 'later call after delay should execute')
}

function testThrottleArguments(): void {
  let total = 0

  withMockedNow([0, 10, 200], () => {
    const add = (a: number, b: number) => {
      total += a + b
    }
    const throttledAdd = throttle(add, 100)

    throttledAdd(2, 3) // runs
    throttledAdd(7, 8) // blocked
    throttledAdd(1, 4) // runs
  })

  assert(total === 10, 'arguments should pass through for executed calls')
}

function throttleTrailing<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null

  return (...args: Parameters<T>) => {
    pendingArgs = args
    if (timer) return

    timer = setTimeout(() => {
      if (pendingArgs) {
        fn(...pendingArgs)
      }
      pendingArgs = null
      timer = null
    }, delay)
  }
}

function compareLeadingVsTrailing(): void {
  const leadingCalls: string[] = []
  const trailingCalls: string[] = []

  const leading = throttle((label: string) => leadingCalls.push(label), 100)
  const trailing = throttleTrailing((label: string) => trailingCalls.push(label), 100)

  leading('first')
  leading('mid')
  leading('last')

  trailing('first')
  trailing('mid')
  trailing('last')

  // At this point:
  // - leading already executed "first"
  // - trailing has not executed yet; it will execute "last" after delay
  console.log('leading throttle immediate calls:', leadingCalls)
  console.log('trailing throttle pending calls:', trailingCalls)
}

testThrottleBasicBehavior()
testThrottleArguments()
compareLeadingVsTrailing()

console.log('throttle tests passed')
