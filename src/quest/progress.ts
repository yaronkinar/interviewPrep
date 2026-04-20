const STORAGE_KEY = 'quest:progress'

export type QuestProgress = {
  /** Level ids that have been completed at least once. */
  completed: string[]
}

const EMPTY: QuestProgress = { completed: [] }

export function loadProgress(): QuestProgress {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as QuestProgress
    if (!Array.isArray(parsed.completed)) return EMPTY
    return parsed
  } catch {
    return EMPTY
  }
}

export function saveProgress(progress: QuestProgress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    /* localStorage quota / private mode — silently ignore. */
  }
}

export function markCompleted(id: string): QuestProgress {
  const cur = loadProgress()
  if (cur.completed.includes(id)) return cur
  const next: QuestProgress = { completed: [...cur.completed, id] }
  saveProgress(next)
  return next
}
