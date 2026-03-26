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

