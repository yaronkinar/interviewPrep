import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

interface GalleryItem {
  id: number
  title: string
  src: string
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="%23131b2a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2396a3bf" font-size="18">loading...</text></svg>'

const IMPL = `function throttle(fn, wait) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn(...args)
    }
  }
}

useEffect(() => {
  const checkVisible = throttle(() => {
    for (const card of cards) {
      if (cardIsNearViewport(card) && !loaded.has(card.id)) {
        setLoaded(prev => new Set(prev).add(card.id))
      }
    }
  }, 150)

  checkVisible()
  window.addEventListener('scroll', checkVisible, { passive: true })
  window.addEventListener('resize', checkVisible)
  return () => {
    window.removeEventListener('scroll', checkVisible)
    window.removeEventListener('resize', checkVisible)
  }
}, [cards, loaded])`

function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= wait) {
      last = now
      fn(...args)
    }
  }
}

export default function LazyLoadThrottleDemo() {
  const items = useMemo<GalleryItem[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Landscape ${i + 1}`,
        src: `https://picsum.photos/id/${30 + i}/640/360`,
      })),
    []
  )

  const refs = useRef<Record<number, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set())
  const [isNarrowPhone, setIsNarrowPhone] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 360 : false
  )

  useEffect(() => {
    const handleResize = () => {
      setIsNarrowPhone(window.innerWidth < 360)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const markVisibleCards = () => {
      const preloadOffset = 160
      const container = scrollContainerRef.current
      const viewportTop = container ? container.getBoundingClientRect().top : 0
      const viewportBottom = container
        ? container.getBoundingClientRect().bottom
        : window.innerHeight
      let changed = false

      setLoadedIds((prev) => {
        const next = new Set(prev)
        for (const item of items) {
          if (next.has(item.id)) continue
          const el = refs.current[item.id]
          if (!el) continue
          const rect = el.getBoundingClientRect()
          const inPreloadZone =
            rect.top <= viewportBottom + preloadOffset &&
            rect.bottom >= viewportTop - preloadOffset
          if (inPreloadZone) {
            next.add(item.id)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }

    const throttledCheck = throttle(markVisibleCards, 150)
    markVisibleCards()
    const container = scrollContainerRef.current
    container?.addEventListener('scroll', throttledCheck, { passive: true })
    window.addEventListener('resize', throttledCheck)

    return () => {
      container?.removeEventListener('scroll', throttledCheck)
      window.removeEventListener('resize', throttledCheck)
    }
  }, [items])

  return (
    <div className="card">
      <div className="card-title">Lazy Loading + Throttle</div>
      <p className="card-desc">
        Images load only when cards get near the viewport. Scroll checks are throttled to reduce
        expensive layout reads.
      </p>

      <div
        ref={scrollContainerRef}
        className="demo-output"
        style={{ maxHeight: 300, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isNarrowPhone
              ? 'minmax(0, 1fr)'
              : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          {items.map((item) => {
            const loaded = loadedIds.has(item.id)
            return (
              <div
                key={item.id}
                ref={(el) => {
                  refs.current[item.id] = el
                }}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--panel-2)',
                }}
              >
                <img
                  src={loaded ? item.src : PLACEHOLDER}
                  alt={item.title}
                  style={{ width: '100%', display: 'block', aspectRatio: '16 / 9', objectFit: 'cover' }}
                />
                <div style={{ padding: '0.45rem 0.6rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {item.title} {loaded ? '• loaded' : '• pending'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation
          steps={[
            {
              text: (
                <>
                  Keep a <code>Set</code> of loaded ids, so each image is fetched only once.
                </>
              ),
            },
            {
              text: (
                <>
                  Use <code>getBoundingClientRect()</code> to decide when a card is in or near view.
                </>
              ),
            },
            {
              text: (
                <>
                  Wrap scroll/resize handler with <code>throttle</code> so checks run at most every
                  ~150ms.
                </>
              ),
            },
            {
              text: (
                <>
                  Add a preload offset to start loading a bit early and avoid visible pop-in.
                </>
              ),
            },
          ]}
        />
      </CollapsibleCode>
    </div>
  )
}

