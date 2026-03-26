import { useState, useRef, useEffect } from 'react'
import LogPanel, { type LogEntry } from '../components/LogPanel'
import { CollapsibleCode, Explanation } from '../components/CodeBlock'

const IMAGES = Array.from({ length: 8 }, (_, i) =>
  `https://picsum.photos/seed/lazy${i + 1}/600/80`
)

const IMPL = `const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src   // swap placeholder → real URL
        observer.unobserve(img)     // stop watching once loaded
      }
    }
  },
  { rootMargin: '50px 0px', threshold: 0.1 }
)

document.querySelectorAll('img[data-src]')
        .forEach(img => observer.observe(img))`

const USAGE = `// React equivalent (custom hook)
function useLazyImage(ref, dataSrc) {
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        ref.current.src = dataSrc
        obs.disconnect()
      }
    })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [dataSrc])
}`

export default function LazyLoadCard() {
  const [loaded, setLoaded] = useState(0)
  const [margin, setMargin] = useState(50)
  const [log, setLog] = useState<LogEntry[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [key, setKey] = useState(0)

  function addLog(text: string, type: LogEntry['type']) {
    setLog(prev => [...prev, { text, type }])
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    observerRef.current?.disconnect()

    const imgs = container.querySelectorAll<HTMLImageElement>('img[data-src]')
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const idx = img.dataset.idx
            img.src = img.dataset.src!
            observerRef.current?.unobserve(img)
            setLoaded(l => l + 1)
            addLog(`↓ image ${idx} fetched`, 'fire')
          }
        })
      },
      { root: container, rootMargin: `${margin}px 0px`, threshold: 0.1 }
    )
    imgs.forEach(img => observerRef.current?.observe(img))
    addLog(`Observer created — rootMargin: ${margin}px`, 'info')

    return () => observerRef.current?.disconnect()
  }, [key, margin])

  function reset() {
    setLoaded(0)
    setLog([])
    setKey(k => k + 1)
  }

  return (
    <div className="card">
      <div className="card-title">Lazy Loading</div>
      <p className="card-desc">Images are not fetched until they scroll into view. <code>IntersectionObserver</code> swaps <code>data-src</code> → <code>src</code> on intersection.</p>

      <div className="params">
        <span><span className="v">rootMargin</span> =</span>
        <input type="number" value={margin} min={0} max={400} step={10}
          onChange={e => setMargin(+e.target.value)} />
        <span>px</span>
      </div>

      <div className="controls">
        <button className="secondary" onClick={reset}>Reset images</button>
      </div>

      <div className="stat-row">
        <div className="stat"><div className="stat-value">{IMAGES.length}</div><div className="stat-label">Total</div></div>
        <div className="stat"><div className="stat-value">{loaded}</div><div className="stat-label">Loaded</div></div>
        <div className="stat"><div className="stat-value">{IMAGES.length - loaded}</div><div className="stat-label">Pending</div></div>
      </div>

      <div ref={containerRef} className="lazy-scroll" key={key}>
        {IMAGES.map((src, i) => (
          <div key={i} className="lazy-img-wrap">
            <span className="lazy-placeholder">image {i + 1} — waiting…</span>
            <img
              data-src={src}
              data-idx={i + 1}
              alt={`Lazy image ${i + 1}`}
              onLoad={e => {
                e.currentTarget.classList.add('loaded')
                const ph = e.currentTarget.previousElementSibling as HTMLElement
                if (ph) ph.classList.add('hidden')
              }}
            />
          </div>
        ))}
      </div>

      <LogPanel entries={log} />

      <CollapsibleCode label="implementation" code={IMPL}>
        <Explanation steps={[
          { text: <>Images rendered with <code>data-src</code> — browser never requests them upfront.</> },
          { text: <><code>IntersectionObserver</code> fires whenever a watched element enters the viewport.</> },
          { text: <>On intersection, <code>img.src</code> is set from <code>data-src</code> — triggering the fetch.</> },
          { text: <><code>unobserve</code> is called immediately so each image loads only once.</> },
          { text: <><code>rootMargin</code> pre-fetches images slightly before they enter view, preventing blank flashes.</> },
        ]} />
      </CollapsibleCode>
      <CollapsibleCode label="usage (React hook)" code={USAGE} />
    </div>
  )
}
