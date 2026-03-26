/**
 * Explanation:
 * Throttle limits execution rate: function runs at most once per interval,
 * which is useful for high-frequency events like scroll and resize.
 *
 * Interview Thinking Process:
 * 1) Clarify variant: this implementation is leading-edge throttle.
 * 2) Store last execution timestamp in closure.
 * 3) On each call, compare elapsed time with delay.
 * 4) Execute only when enough time has passed.
 * 5) Mention extension: trailing invocation support if requested.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      fn(...args);
      lastCall = now;
    }
  };
}

