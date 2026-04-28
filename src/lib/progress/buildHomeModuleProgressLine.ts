import type { Locale } from '@/i18n/locale'
import type { HomeStrings } from '@/i18n/strings'
import { formatRelativePast } from '@/lib/formatRelativePast'
import type { UserProgress } from '@/lib/models/UserProgress'

/** One line of copy for a home module from saved `userProgress` (API JSON). */
export function buildHomeModuleProgressLine(
  h: Pick<
    HomeStrings,
    'progressLineBoth' | 'progressLineCountOnly' | 'progressLineVisitedOnly' | 'progressNotStarted'
  >,
  locale: Locale,
  row: UserProgress | undefined,
): string {
  const count = row?.completedQuestionIds?.length ?? 0
  let last: Date | null = null
  if (row?.lastVisitedAt != null) {
    const d = new Date(row.lastVisitedAt as unknown as string | number | Date)
    if (!Number.isNaN(d.getTime())) last = d
  }

  const when = last ? formatRelativePast(last, locale) : ''

  if (count > 0 && when) {
    return h.progressLineBoth.replace('{count}', String(count)).replace('{when}', when)
  }
  if (count > 0) {
    return h.progressLineCountOnly.replace('{count}', String(count))
  }
  if (when) {
    return h.progressLineVisitedOnly.replace('{when}', when)
  }
  return h.progressNotStarted
}
