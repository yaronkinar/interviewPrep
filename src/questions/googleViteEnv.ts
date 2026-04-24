/**
 * Single Google API key for local dev when you do not split Gemini vs Cloud TTS.
 * Specific vars take precedence: NEXT_PUBLIC_GEMINI_API_KEY, NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY.
 */
export function readViteGoogleDevApiKeyFromEnv(): string {
  try {
    const v = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    return typeof v === 'string' && v.trim() ? v.trim() : ''
  } catch {
    return ''
  }
}
