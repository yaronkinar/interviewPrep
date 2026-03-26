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
