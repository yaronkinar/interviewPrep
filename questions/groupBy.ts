const users = [
    { id: 1, team: 'A' },
    { id: 2, team: 'B' },
    { id: 3, team: 'A' },
]

console.log(groupBy(users, "team"))
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
function groupBy2(array: any[], selector: string) {
    return array.reduce<Record<string, any[]>>((acc, item) => {
        const key = String(item[String(selector)])
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
    }, {})
}
// Built-in option (newer runtimes): Object.groupBy(users, user => user.team)
