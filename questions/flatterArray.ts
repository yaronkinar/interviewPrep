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
