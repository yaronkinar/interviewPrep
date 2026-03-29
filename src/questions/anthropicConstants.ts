/** Default model for BYOK chat (override in UI). Alias resolves to latest Haiku 4.5 snapshot. */
export const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5'

/** Old IDs that may still be in localStorage; API returns 404 — map to a current model. */
const DEPRECATED_MODEL_IDS: Record<string, string> = {
  'claude-3-5-haiku-20241022': DEFAULT_ANTHROPIC_MODEL,
  'claude-3-5-haiku-latest': DEFAULT_ANTHROPIC_MODEL,
}

export function normalizeAnthropicModel(stored: string | null | undefined): string {
  const t = stored?.trim() ?? ''
  if (!t) return DEFAULT_ANTHROPIC_MODEL
  return DEPRECATED_MODEL_IDS[t] ?? t
}

export const ANTHROPIC_API_KEY_SESSION_KEY = 'interviews:anthropicApiKeySession'
export const ANTHROPIC_API_KEY_LOCAL_KEY = 'interviews:anthropicApiKeyLocal'
export const ANTHROPIC_KEY_PERSIST_MODE_KEY = 'interviews:anthropicKeyPersist' // 'session' | 'local'

export const ANTHROPIC_MODEL_STORAGE_KEY = 'interviews:anthropicModel'
