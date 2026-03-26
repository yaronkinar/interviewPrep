import MemoizeCard from './MemoizeCard'
import DebounceCard from './DebounceCard'
import ThrottleCard from './ThrottleCard'
import LazyLoadCard from './LazyLoadCard'
import Sandbox from './Sandbox'

export default function JsPage() {
  return (
    <>
      <h1 className="page-title">JS Patterns</h1>
      <div className="grid">
        <MemoizeCard />
        <DebounceCard />
        <ThrottleCard />
        <LazyLoadCard />
      </div>
      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0' }}>
        <div className="grid full">
          <Sandbox />
        </div>
      </div>
    </>
  )
}
