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
