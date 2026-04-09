import type { Question, Category, Difficulty } from './data'

/** Base slot length by difficulty (typical phone-screen vs onsite coding). */
const BASE_SECONDS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 6 * 60,
  medium: 12 * 60,
  hard: 20 * 60,
}

/** Extra time for categories that usually need more depth in a real loop. */
const CATEGORY_EXTRA_SECONDS: Partial<Record<Category, number>> = {
  'System Design': 10 * 60,
  Algorithms: 3 * 60,
  Performance: 3 * 60,
}

export function getMockTimeLimitSeconds(q: Question): number {
  const base = BASE_SECONDS_BY_DIFFICULTY[q.difficulty]
  const extra = CATEGORY_EXTRA_SECONDS[q.category] ?? 0
  return base + extra
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** Wall-clock style for session timers (e.g. 00:24:12). */
export function formatClockHms(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`
}

export function formatDurationLabel(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm ? `${h} h ${rm} min` : `${h} h`
}

/** Human-readable breakdown for the UI (difficulty base + optional category allowance). */
export function describeMockTimeBudget(q: Question): string {
  const base = BASE_SECONDS_BY_DIFFICULTY[q.difficulty]
  const extra = CATEGORY_EXTRA_SECONDS[q.category] ?? 0
  const baseMin = Math.round(base / 60)
  if (extra === 0) return `${baseMin} min (${q.difficulty})`
  const extraMin = Math.round(extra / 60)
  return `${baseMin} min (${q.difficulty}) + ${extraMin} min (${q.category})`
}
