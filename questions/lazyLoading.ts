/**
 * Explanation:
 * Lazy loading defers image fetches until they are near visibility, reducing
 * initial page load cost and improving perceived performance.
 *
 * Interview Thinking Process:
 * 1) State goal: defer image downloads until near viewport.
 * 2) Use `data-src` for real URL and lightweight placeholder in `src`.
 * 3) Observe each image and swap `src` when intersecting.
 * 4) Unobserve after loading to avoid repeated work.
 * 5) Tune `rootMargin` for preloading and smoother UX.
 */
const observer = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset['src']!;
                observer.unobserve(img);
            }
        }
    },
    { rootMargin: '200px 0px', threshold: 0.1 }
);

document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach(img => {
    observer.observe(img);
});
