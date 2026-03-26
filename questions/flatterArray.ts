/**
 * Explanation:
 * Flatten converts a nested array into a single-level array while preserving order.
 * Recursion is a clean DFS approach for unknown nesting depth.
 *
 * Interview Thinking Process:
 * 1) Confirm input shape: nested arrays of unknown depth.
 * 2) Pick approach: recursion (DFS) is simplest and expressive.
 * 3) Define base case: empty array returns empty result.
 * 4) For each item: recurse if array, otherwise append value.
 * 5) Discuss alternatives: iterative stack to avoid deep recursion limits.
 */
function flatten<T>(arr: T[]): T[] {
  if (arr.length === 0) return []
  const res: T[] = []
  arr.forEach((item) => {
    if (Array.isArray(item)) {
      res.push(...flatten(item as T[]))
    } else {
      res.push(item)
    }
  })
  return res
}

const arr = [1, ["a", [3, 4]], 5]
console.log(flatten(arr))

function flatterer<T>(arr: T[]): T[] {
  return arr.reduce<T[]>((acc, cur) => {
    return acc.concat(Array.isArray(cur) ? flatterer(cur as T[]) : [cur])
  }, [])
}
console.log(flatterer(arr))
