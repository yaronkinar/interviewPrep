/**
 * Single Google API key for local dev when you do not split Gemini vs Cloud TTS.
 * `readDefaultGeminiKeyFromEnv` and `readDefaultGoogleCloudTtsKeyFromEnv` both use this after their dedicated env vars.
 */
export function readViteGoogleDevApiKeyFromEnv(): string {
  try {
    const v = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    return typeof v === 'string' && v.trim() ? v.trim() : ''
  } catch {
    return ''
  }
}
