import type { HomeProgressTrack } from '@/lib/progress/pathToProgressSection'
import { HOME_PROGRESS_TRACKS } from '@/lib/progress/pathToProgressSection'
import type { UserProgress } from '@/lib/models/UserProgress'

function score(row: UserProgress | undefined): number {
  const n = row?.completedQuestionIds?.length ?? 0
  const t = row?.lastVisitedAt
    ? new Date(row.lastVisitedAt as unknown as string | number | Date).getTime()
    : 0
  return n * 1e12 + t
}

/** Featured track + two side tracks for dashboard bento (Stitch screen 10). */
export function pickFeaturedHomeModules(
  bySection: Map<string, UserProgress | undefined>,
): [HomeProgressTrack, HomeProgressTrack, HomeProgressTrack] {
  const tracks = [...HOME_PROGRESS_TRACKS]
  const ranked = tracks.slice().sort((a, b) => score(bySection.get(b)) - score(bySection.get(a)))
  const featured = ranked[0] ?? 'js'
  const sideA = ranked[1] ?? 'react'
  const sideB = ranked[2] ?? 'typescript'
  return [featured, sideA, sideB]
}
