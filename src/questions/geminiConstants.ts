import { readViteGoogleDevApiKeyFromEnv } from './googleViteEnv'

export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash'

export const GEMINI_API_KEY_SESSION_KEY = 'interviews:geminiApiKeySession'
export const GEMINI_API_KEY_LOCAL_KEY = 'interviews:geminiApiKeyLocal'
export const GEMINI_MODEL_STORAGE_KEY = 'interviews:geminiModel'

export function normalizeGeminiModel(stored: string | null | undefined): string {
  const t = stored?.trim()
  if (!t) return DEFAULT_GEMINI_MODEL
  return t
}

/** Optional default from Vite env when the user has not saved a key in the browser. */
export function readDefaultGeminiKeyFromEnv(): string {
  try {
    const g = import.meta.env.VITE_GEMINI_API_KEY
    if (typeof g === 'string' && g.trim()) return g.trim()
    return readViteGoogleDevApiKeyFromEnv()
  } catch {
    return ''
  }
}
