/**
 * Explanation:
 * This file demonstrates a basic Subject/Observer pattern implementation with
 * subscribe, emit (`next`), and cleanup behavior.
 *
 * Interview Thinking Process:
 * 1) Define core contract: subscribe returns unsubscribe function.
 * 2) Store listeners in a `Set` for uniqueness and O(1) add/remove.
 * 3) Broadcast values to all listeners with `next`.
 * 4) Isolate listener failures so one bad handler does not break others.
 * 5) Add lifecycle helpers like `clear` and mention complete/error evolution.
 */
type Unsubscribe = () => void;
type Events = 'data' | 'error';
export class Subject<T> {
    private listeners = new Set<(value: T) => void>();


    subscribe(listener: (value: T) => void): Unsubscribe {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    on(listener: (value: keyof Events) => void): Unsubscribe {
        return this.subscribe(listener);
    }
    off(listener: (value: T) => void): void {}
    next(value: T): void {
        for (const listener of this.listeners) {
            try {
                listener(value);
            } catch (err) {
                // Don't break other listeners.
                // In real life: report error to logger/monitoring
            }
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}

let subject = new Subject<number>();
subject.on(value => console.log(value));



