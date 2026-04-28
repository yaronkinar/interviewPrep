import type { UserProgress } from '@/lib/models/UserProgress'
import { HOME_PROGRESS_TRACKS } from '@/lib/progress/pathToProgressSection'

function rowHasActivity(row: UserProgress | undefined): boolean {
  if (!row) return false
  if ((row.completedQuestionIds?.length ?? 0) > 0) return true
  if (row.lastVisitedAt == null) return false
  const t = new Date(row.lastVisitedAt as unknown as string | number | Date)
  return !Number.isNaN(t.getTime())
}

/** How many home tracks (js, react, …) have any visit or bookmarked-question progress. */
export function countActiveHomeSections(bySection: Map<string, UserProgress>): number {
  let n = 0
  for (const id of HOME_PROGRESS_TRACKS) {
    if (rowHasActivity(bySection.get(id))) n += 1
  }
  return n
}

export function qaBookmarkProgressCount(bySection: Map<string, UserProgress>): number {
  return bySection.get('questions')?.completedQuestionIds?.length ?? 0
}
