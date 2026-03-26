/**
 * Explanation:
 * Memoization caches function results by input key so repeated calls with the
 * same arguments return instantly without re-running expensive logic.
 *
 * Interview Thinking Process:
 * 1) Clarify when caching is safe: function should be pure/deterministic.
 * 2) Choose cache structure: `Map` for O(1) average lookup.
 * 3) Build stable cache keys from arguments.
 * 4) On call: return cached value if present; otherwise compute and store.
 * 5) Discuss production concerns: key collisions, memory growth, TTL/LRU.
 */
export function memoize<T extends (...args:any[]) => any>(fn: T): T {
    const result = new Map();
    const getKey = (...args: any[]) => {
        // עבור args פשוטים — המפתח הוא ה-arg עצמו (תומך בכל טיפוס)
        return args.length === 1 ? args[0] : args.join("__");
    }
    return function (...args: any[]) {
        const key = getKey(...args);
        console.log(key);
        if (result.has(key)) {
            console.log("from cache");
            return result.get(key);
        }
        const value = fn(...args)
        console.log(value);
        result.set(key, value);
        return value;
    } as T;

}
