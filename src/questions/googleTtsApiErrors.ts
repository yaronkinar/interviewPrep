/**
 * Parses Google Cloud Text-to-Speech REST error bodies into short UI copy.
 * @see https://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize
 */
export function friendlyGoogleTtsErrorMessage(status: number, responseBody: string): string {
  const trimmed = responseBody.trim()
  if (!trimmed) {
    return status === 403
      ? 'Google Cloud TTS returned 403. Enable the Cloud Text-to-Speech API for the Google Cloud project attached to this API key, and ensure billing is enabled if required.'
      : `Google Cloud TTS failed (HTTP ${status}).`
  }

  try {
    const j = JSON.parse(trimmed) as {
      error?: {
        message?: string
        details?: Array<{ reason?: string; metadata?: Record<string, string> }>
      }
    }
    const details = j.error?.details ?? []
    for (const d of details) {
      if (d.reason === 'SERVICE_DISABLED' && d.metadata?.activationUrl) {
        return `Cloud Text-to-Speech is turned off for this API key’s Google Cloud project. Enable the API in the console, wait a few minutes, then try again: ${d.metadata.activationUrl}`
      }
    }
    const msg = j.error?.message
    if (typeof msg === 'string' && msg.length > 0) {
      // API key "Application restrictions" / "API restrictions" — common for browser calls.
      if (/blocked/i.test(msg) && /texttospeech|TextToSpeech|SynthesizeSpeech/i.test(msg)) {
        return (
          'Google blocked Text-to-Speech for this API key (restrictions). In Google Cloud → APIs & Services → Credentials → edit the key: ' +
          'allow Cloud Text-to-Speech under API restrictions (or “Don’t restrict key” for local testing only). ' +
          'If Application restrictions uses HTTP referrers, add each origin you use (e.g. http://localhost:5173/* and http://127.0.0.1:5173/*). ' +
          'https://cloud.google.com/api-keys/docs/add-restrictions-api-keys'
        )
      }
      const urlMatch = msg.match(/https:\/\/console\.developers\.google\.com[^\s"]+/)
      if (urlMatch) {
        return `Google Cloud TTS: ${msg.split('. Enable')[0]}. Enable it here: ${urlMatch[0]}`
      }
      return msg.length > 400 ? `${msg.slice(0, 400)}…` : msg
    }
  } catch {
    const urlMatch = trimmed.match(/https:\/\/console\.developers\.google\.com[^\s"]+/)
    if (urlMatch) {
      return `Google Cloud TTS error (HTTP ${status}). Enable the API: ${urlMatch[0]}`
    }
  }

  return `Google Cloud TTS failed (HTTP ${status}).`
}
