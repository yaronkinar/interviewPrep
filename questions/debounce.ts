/**
 * Interview Thinking Steps (Debounce):
 * 1) Clarify behavior: reset timer on each call, run once after quiet period.
 * 2) Decide API: preserve argument types and return a wrapped function.
 * 3) Keep state in closure: store timeout id across invocations.
 * 4) On each call: clear existing timer, schedule a new one.
 * 5) Mention edge cases: immediate mode/cancel/flush can be added if requested.
 */
export function debounce<A extends unknown[], R>(
  fn: ( ...args: A) => R,
  delay: number
): (...args: A) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function ( ...args: A) {

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(function () {
      fn( ...args)
    }, delay)
  }
}

