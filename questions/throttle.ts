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

