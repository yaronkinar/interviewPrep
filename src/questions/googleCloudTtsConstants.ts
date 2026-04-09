import { readViteGoogleDevApiKeyFromEnv } from './googleViteEnv'

export const GOOGLE_CLOUD_TTS_API_KEY_SESSION_KEY = 'interviews:googleCloudTtsApiKeySession'
export const GOOGLE_CLOUD_TTS_API_KEY_LOCAL_KEY = 'interviews:googleCloudTtsApiKeyLocal'

/** Optional default from Vite env when the user has not saved a key in the browser. */
export function readDefaultGoogleCloudTtsKeyFromEnv(): string {
  try {
    const t = import.meta.env.VITE_GOOGLE_CLOUD_TTS_API_KEY
    if (typeof t === 'string' && t.trim()) return t.trim()
    return readViteGoogleDevApiKeyFromEnv()
  } catch {
    return ''
  }
}
