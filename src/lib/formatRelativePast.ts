import type { Locale } from '@/i18n/locale'

function localeToTag(locale: Locale): string {
  switch (locale) {
    case 'zh':
      return 'zh-CN'
    case 'he':
      return 'he-IL'
    case 'hi':
      return 'hi-IN'
    default:
      return locale
  }
}

/** “3 days ago”, “Yesterday”, suitable for UI labels. Empty if date is invalid. */
export function formatRelativePast(date: Date, locale: Locale): string {
  if (Number.isNaN(date.getTime())) return ''

  const nowMs = Date.now()
  let diffSeconds = Math.round((date.getTime() - nowMs) / 1000)
  if (diffSeconds > 0) diffSeconds = 0

  const abs = Math.abs(diffSeconds)

  const rtf = new Intl.RelativeTimeFormat(localeToTag(locale), { numeric: 'auto' })

  if (abs < 60) return rtf.format(Math.round(diffSeconds), 'second')
  const mins = Math.round(diffSeconds / 60)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hrs = Math.round(diffSeconds / 3600)
  if (Math.abs(hrs) < 24) return rtf.format(hrs, 'hour')
  const days = Math.round(diffSeconds / 86400)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  const months = Math.round(diffSeconds / (86400 * 30))
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(diffSeconds / (86400 * 365)), 'year')
}
