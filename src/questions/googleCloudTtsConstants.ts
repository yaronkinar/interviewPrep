import { readDefaultGeminiKeyFromEnv } from './geminiConstants'

export const GOOGLE_CLOUD_TTS_API_KEY_SESSION_KEY = 'interviews:googleCloudTtsApiKeySession'
export const GOOGLE_CLOUD_TTS_API_KEY_LOCAL_KEY = 'interviews:googleCloudTtsApiKeyLocal'

/**
 * Optional default from env when the user has not saved a key in the browser.
 * Precedence: dedicated TTS key → same keys as Gemini (`NEXT_PUBLIC_GEMINI_API_KEY`, then `NEXT_PUBLIC_GOOGLE_API_KEY`).
 */
export function readDefaultGoogleCloudTtsKeyFromEnv(): string {
  try {
    const t = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY
    if (typeof t === 'string' && t.trim()) return t.trim()
    return readDefaultGeminiKeyFromEnv()
  } catch {
    return ''
  }
}
