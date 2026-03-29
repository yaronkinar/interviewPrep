export const LOCALE_STORAGE_KEY = 'interview-prep-locale'

/** BCP-47 base codes we ship UI copy for */
export const SUPPORTED_LOCALES = [
  'en',
  'he',
  'es',
  'fr',
  'de',
  'pt',
  'ja',
  'zh',
  'ar',
  'ru',
  'hi',
  'pl',
  'ko',
] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

const RTL_LOCALES = new Set<Locale>(['he', 'ar'])

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.has(locale)
}

export function normalizeToSupported(raw: string | undefined | null): Locale {
  if (!raw || typeof raw !== 'string') return 'en'
  const lower = raw.trim().toLowerCase()
  const base = lower.split('-')[0] ?? 'en'
  if (base === 'zh' || lower.startsWith('zh-')) return 'zh'
  if ((SUPPORTED_LOCALES as readonly string[]).includes(base)) {
    return base as Locale
  }
  return 'en'
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  const preferred = navigator.languages?.[0] ?? navigator.language
  return normalizeToSupported(preferred)
}

export function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (!v) return null
    return normalizeToSupported(v)
  } catch {
    return null
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export function getInitialLocale(): Locale {
  return readStoredLocale() ?? detectBrowserLocale()
}
