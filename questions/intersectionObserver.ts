/**
 * Explanation:
 * This file implements a simplified IntersectionObserver by computing overlap
 * between target bounds and current viewport bounds.
 *
 * Interview Thinking Process:
 * 1) Define intersection mathematically using viewport and target bounds.
 * 2) Compute visible segment: max(top), min(bottom), clamp at zero.
 * 3) Derive ratio: visibleHeight / targetHeight.
 * 4) Compare ratio to threshold and emit entries via callback.
 * 5) Discuss complexity: O(number of observed targets) per check cycle.
 */
type ObserverCallback = (entries: ObserverEntry[]) => void;

interface ObserverEntry {
    target: ObservableElement;
    isIntersecting: boolean;
    intersectionRatio: number;
}

interface ObservableElement {
    top: number;
    bottom: number;
    id: string;
}

interface ViewPort {
    top: number;
    bottom: number;
}

export class MyIntersectionObserver {
    private callback: ObserverCallback;
    private targets = new Set<ObservableElement>();
    private threshold: number;

    constructor(callback: ObserverCallback, options: { threshold?: number } = {}) {
        this.callback = callback;
        this.threshold = options.threshold ?? 0;
    }

    observe(element: ObservableElement): void {
        this.targets.add(element);
    }

    unobserve(element: ObservableElement): void {
        this.targets.delete(element);
    }

    disconnect(): void {
        this.targets.clear();
    }

    // Call this whenever the viewport changes (scroll/resize)
    checkIntersections(viewport: ViewPort): void {
        const entries: ObserverEntry[] = [];

        for (const target of this.targets) {
            const visibleTop = Math.max(target.top, viewport.top);
            const visibleBottom = Math.min(target.bottom, viewport.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const targetHeight = target.bottom - target.top;
            const intersectionRatio = targetHeight > 0 ? visibleHeight / targetHeight : 0;
            const isIntersecting = intersectionRatio > this.threshold;

            entries.push({ target, isIntersecting, intersectionRatio });
        }

        if (entries.length > 0) {
            this.callback(entries);
        }
    }
}

export function runIntersectionObserverDemo(): void {
    const observer = new MyIntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    console.log(`  Element "${entry.target.id}" is visible (${Math.round(entry.intersectionRatio * 100)}%)`);
                } else {
                    console.log(`  Element "${entry.target.id}" is out of view`);
                }
            }
        },
        { threshold: 0.5 }
    );

    const img1: ObservableElement = { id: 'img-1', top: 100, bottom: 300 };
    const img2: ObservableElement = { id: 'img-2', top: 500, bottom: 700 };
    const img3: ObservableElement = { id: 'img-3', top: 900, bottom: 1100 };

    observer.observe(img1);
    observer.observe(img2);
    observer.observe(img3);

    console.log('  --- Viewport: 0-400 ---');
    observer.checkIntersections({ top: 0, bottom: 400 });

    console.log('  --- Viewport: 400-800 ---');
    observer.checkIntersections({ top: 400, bottom: 800 });

    console.log('  --- Viewport: 800-1200 ---');
    observer.checkIntersections({ top: 800, bottom: 1200 });
}
