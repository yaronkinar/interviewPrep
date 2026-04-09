/** Curated Google Cloud Text-to-Speech Neural2 voices (see cloud.google.com/text-to-speech/docs/voices). */
export interface GoogleCloudTtsVoiceProfile {
  /** Full API voice name, e.g. en-US-Neural2-F */
  name: string
  label: string
  locale: string
}

export const GOOGLE_CLOUD_TTS_VOICES: GoogleCloudTtsVoiceProfile[] = [
  { name: 'en-US-Neural2-F', label: 'Rachel (US, Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-C', label: 'US English C (Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-E', label: 'US English E (Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-G', label: 'US English G (Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-H', label: 'US English H (Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-J', label: 'US English J (Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-A', label: 'US English A (Neural2)', locale: 'en-US' },
  { name: 'en-US-Neural2-D', label: 'US English D (Neural2)', locale: 'en-US' },
  { name: 'en-GB-Neural2-A', label: 'UK English A (Neural2)', locale: 'en-GB' },
  { name: 'en-GB-Neural2-B', label: 'UK English B (Neural2)', locale: 'en-GB' },
  { name: 'en-GB-Neural2-C', label: 'UK English C (Neural2)', locale: 'en-GB' },
  { name: 'en-AU-Neural2-A', label: 'Australian A (Neural2)', locale: 'en-AU' },
  { name: 'en-AU-Neural2-B', label: 'Australian B (Neural2)', locale: 'en-AU' },
]

export const DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME = GOOGLE_CLOUD_TTS_VOICES[0].name

export function languageCodeFromGoogleVoiceName(voiceName: string): string {
  const parts = voiceName.split('-')
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`
  return 'en-US'
}
