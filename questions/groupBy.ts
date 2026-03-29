/**
 * Explanation:
 * `groupBy` partitions array items into buckets based on either a property key
 * or a selector function, returning object or map depending on selector type.
 *
 * Interview Thinking Process:
 * 1) Clarify expected output: object for property keys vs map for dynamic keys.
 * 2) Preserve type safety with overloads for key name and callback selector.
 * 3) Traverse once and accumulate buckets in O(n).
 * 4) Convert map entries to object when selector is a property name.
 * 5) Mention trade-offs: Map supports non-string keys and stable insertion order.
 */
const users = [
    { id: 1, team: 'A' },
    { id: 2, team: 'B' },
    { id: 3, team: 'A' },
]

console.log(groupBy(users, (item) => item.team))
console.log(groupBy2(users, "team"))

type Key = string | number | symbol

function groupBy<T, K extends keyof T>(array: T[], selector: K): Record<string, T[]>
function groupBy<T, K extends Key>(array: T[], selector: (item: T) => K): Map<K, T[]>
function groupBy<T, K extends Key>(array: T[], selector: keyof T | ((item: T) => K)) {
    const keySelector: (item: T) => K =
        typeof selector === 'function'
            ? (selector as (item: T) => K)
            : ((item: T) => (item as any)[selector] as K)

    const grouped = array.reduce<Map<K, T[]>>((acc, item) => {
        const key = keySelector(item)
        const bucket = acc.get(key)
        if (bucket) bucket.push(item)
        else acc.set(key, [item])
        return acc
    }, new Map<K, T[]>())

    // If grouped by property name, return a plain object (string keys)
    if (typeof selector !== 'function') {
        return Object.fromEntries(
            Array.from(grouped.entries()).map(([k, v]) => [String(k), v])
        )
    }

    return grouped
}
function groupBy2<T>(array: any[], selector: string | ((item: T) => string)) {
    const getKey = (item: any) =>{
        if(typeof selector === "function"){
            return selector(item)
        }
        return (
            item[selector]
        )
    }
    return array.reduce<Record<string, any[]>>((acc, item) => {
        const key = getKey(item)
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
    }, {})
}
// Built-in option (newer runtimes): Object.groupBy(users, user => user.team)
