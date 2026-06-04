import type { Locale } from '../i18n/locale'

const CV_SELF_INTRO_STORAGE_PREFIX = 'interview-prep-cv-self-intro:'

type CvSelfIntroPayloadV1 = {
  v: 1
  savedAt: string
  markdown: string
}

function storageKey(locale: Locale): string {
  return `${CV_SELF_INTRO_STORAGE_PREFIX}${locale}`
}

export function loadCvSelfIntro(locale: Locale): CvSelfIntroPayloadV1 | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(storageKey(locale))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const o = parsed as Record<string, unknown>
    if (o.v !== 1 || typeof o.markdown !== 'string' || typeof o.savedAt !== 'string') return null
    const markdown = o.markdown.trim()
    if (!markdown) return null
    return { v: 1, savedAt: o.savedAt, markdown: o.markdown }
  } catch {
    return null
  }
}

export function saveCvSelfIntro(markdown: string, locale: Locale): void {
  if (typeof window === 'undefined') return
  const text = markdown.trim()
  if (!text) return
  try {
    const payload: CvSelfIntroPayloadV1 = {
      v: 1,
      savedAt: new Date().toISOString(),
      markdown,
    }
    window.localStorage.setItem(storageKey(locale), JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function clearCvSelfIntro(locale: Locale): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(storageKey(locale))
  } catch {
    /* ignore */
  }
}
