export function memoize<T extends (...args: unknown[]) => unknown>(fn: T, maxSize = Infinity) {
  const cache = new Map<string, unknown>()
  const wrapped = (...args: unknown[]) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return { value: cache.get(key), fromCache: true }
    if (cache.size >= maxSize) cache.delete(cache.keys().next().value!)
    const value = fn(...args)
    cache.set(key, value)
    return { value, fromCache: false }
  }
  wrapped.clear = () => cache.clear()
  return wrapped
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: unknown[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  } as T
}

export type ThrottleDebugEvent =
  | { phase: 'calc'; now: number; lastCall: number; elapsed: number; remaining: number; delay: number }
  | { phase: 'immediate-fire'; now: number; delay: number }
  | { phase: 'scheduled-fire'; now: number; delay: number }
  | { phase: 'scheduled'; remaining: number; delay: number }

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
  onDebug?: (event: ThrottleDebugEvent) => void
): T {
  let lastCall = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: unknown[]) {
    const now = Date.now()
    const elapsed = now - lastCall
    const remaining = delay - elapsed
    onDebug?.({ phase: 'calc', now, lastCall, elapsed, remaining, delay })

    if (timer) clearTimeout(timer)
    if (remaining <= 0) {
      fn(...args)
      lastCall = Date.now()
      timer = null
      onDebug?.({ phase: 'immediate-fire', now: lastCall, delay })
    } else {
      onDebug?.({ phase: 'scheduled', remaining, delay })
      timer = setTimeout(() => {
        fn(...args)
        lastCall = Date.now()
        timer = null
        onDebug?.({ phase: 'scheduled-fire', now: lastCall, delay })
      }, remaining)
    }
  } as T
}
