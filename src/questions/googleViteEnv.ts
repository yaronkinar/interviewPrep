/**
 * Single Google API key for local dev when you do not split Gemini vs Cloud TTS.
 * Specific vars take precedence: VITE_GEMINI_API_KEY, VITE_GOOGLE_CLOUD_TTS_API_KEY.
 */
export function readViteGoogleDevApiKeyFromEnv(): string {
  try {
    const v = import.meta.env.VITE_GOOGLE_API_KEY
    return typeof v === 'string' && v.trim() ? v.trim() : ''
  } catch {
    return ''
  }
}
