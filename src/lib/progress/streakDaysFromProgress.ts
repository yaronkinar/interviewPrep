import type { UserProgress } from '@/lib/models/UserProgress'

function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Consecutive calendar days with any practice visit, ending today or yesterday. */
export function streakDaysFromProgress(bySection: Map<string, UserProgress | undefined>): number {
  const keys = new Set<string>()
  for (const p of bySection.values()) {
    if (!p?.lastVisitedAt) continue
    const d = new Date(p.lastVisitedAt as unknown as string | number | Date)
    if (Number.isNaN(d.getTime())) continue
    keys.add(localDayKey(d))
  }
  if (keys.size === 0) return 0

  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  if (!keys.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!keys.has(localDayKey(cursor))) return 0
  }

  let streak = 0
  while (keys.has(localDayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
