export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

export const OPENAI_API_KEY_SESSION_KEY = 'interviews:openaiApiKeySession'
export const OPENAI_API_KEY_LOCAL_KEY = 'interviews:openaiApiKeyLocal'
export const OPENAI_MODEL_STORAGE_KEY = 'interviews:openaiModel'

export function normalizeOpenaiModel(stored: string | null | undefined): string {
  const t = stored?.trim()
  if (!t) return DEFAULT_OPENAI_MODEL
  return t
}

export function readDefaultOpenaiKeyFromEnv(): string {
  try {
    const v = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    return typeof v === 'string' && v.trim() ? v.trim() : ''
  } catch {
    return ''
  }
}
