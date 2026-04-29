/**
 * Curated Google Cloud Text-to-Speech voices (Neural2 / WaveNet — see
 * https://cloud.google.com/text-to-speech/docs/voices ).
 */
import type { Locale } from '../i18n/locale'

export interface GoogleCloudTtsVoiceProfile {
  /** Full API voice name, e.g. en-US-Neural2-F */
  name: string
  label: string
  /** BCP-47 style tag used by the Cloud TTS API `voice.languageCode` */
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
  { name: 'he-IL-Wavenet-A', label: 'Hebrew A (WaveNet)', locale: 'he-IL' },
  { name: 'he-IL-Wavenet-B', label: 'Hebrew B (WaveNet)', locale: 'he-IL' },
  { name: 'he-IL-Wavenet-C', label: 'Hebrew C (WaveNet)', locale: 'he-IL' },
  { name: 'he-IL-Wavenet-D', label: 'Hebrew D (WaveNet)', locale: 'he-IL' },
  { name: 'es-ES-Neural2-A', label: 'Spanish (Spain) A (Neural2)', locale: 'es-ES' },
  { name: 'es-ES-Neural2-E', label: 'Spanish (Spain) E (Neural2)', locale: 'es-ES' },
  { name: 'es-ES-Neural2-F', label: 'Spanish (Spain) F (Neural2)', locale: 'es-ES' },
  { name: 'es-ES-Neural2-G', label: 'Spanish (Spain) G (Neural2)', locale: 'es-ES' },
  { name: 'es-ES-Neural2-H', label: 'Spanish (Spain) H (Neural2)', locale: 'es-ES' },
  { name: 'es-US-Neural2-A', label: 'Spanish (US) A (Neural2)', locale: 'es-US' },
  { name: 'es-US-Neural2-B', label: 'Spanish (US) B (Neural2)', locale: 'es-US' },
  { name: 'es-US-Neural2-C', label: 'Spanish (US) C (Neural2)', locale: 'es-US' },
  { name: 'fr-FR-Neural2-F', label: 'French F (Neural2)', locale: 'fr-FR' },
  { name: 'fr-FR-Neural2-G', label: 'French G (Neural2)', locale: 'fr-FR' },
  { name: 'de-DE-Neural2-G', label: 'German G (Neural2)', locale: 'de-DE' },
  { name: 'de-DE-Neural2-H', label: 'German H (Neural2)', locale: 'de-DE' },
  { name: 'pt-BR-Neural2-A', label: 'Portuguese (Brazil) A (Neural2)', locale: 'pt-BR' },
  { name: 'pt-BR-Neural2-B', label: 'Portuguese (Brazil) B (Neural2)', locale: 'pt-BR' },
  { name: 'pt-BR-Neural2-C', label: 'Portuguese (Brazil) C (Neural2)', locale: 'pt-BR' },
  { name: 'ja-JP-Neural2-B', label: 'Japanese B (Neural2)', locale: 'ja-JP' },
  { name: 'ja-JP-Neural2-C', label: 'Japanese C (Neural2)', locale: 'ja-JP' },
  { name: 'ja-JP-Neural2-D', label: 'Japanese D (Neural2)', locale: 'ja-JP' },
  { name: 'cmn-CN-Wavenet-A', label: 'Mandarin A (WaveNet)', locale: 'cmn-CN' },
  { name: 'cmn-CN-Wavenet-B', label: 'Mandarin B (WaveNet)', locale: 'cmn-CN' },
  { name: 'cmn-CN-Wavenet-C', label: 'Mandarin C (WaveNet)', locale: 'cmn-CN' },
  { name: 'cmn-CN-Wavenet-D', label: 'Mandarin D (WaveNet)', locale: 'cmn-CN' },
  { name: 'ar-XA-Wavenet-A', label: 'Arabic A (WaveNet)', locale: 'ar-XA' },
  { name: 'ar-XA-Wavenet-B', label: 'Arabic B (WaveNet)', locale: 'ar-XA' },
  { name: 'ar-XA-Wavenet-C', label: 'Arabic C (WaveNet)', locale: 'ar-XA' },
  { name: 'ar-XA-Wavenet-D', label: 'Arabic D (WaveNet)', locale: 'ar-XA' },
  { name: 'ru-RU-Wavenet-A', label: 'Russian A (WaveNet)', locale: 'ru-RU' },
  { name: 'ru-RU-Wavenet-B', label: 'Russian B (WaveNet)', locale: 'ru-RU' },
  { name: 'ru-RU-Wavenet-C', label: 'Russian C (WaveNet)', locale: 'ru-RU' },
  { name: 'ru-RU-Wavenet-D', label: 'Russian D (WaveNet)', locale: 'ru-RU' },
  { name: 'ru-RU-Wavenet-E', label: 'Russian E (WaveNet)', locale: 'ru-RU' },
  { name: 'hi-IN-Neural2-A', label: 'Hindi A (Neural2)', locale: 'hi-IN' },
  { name: 'hi-IN-Neural2-B', label: 'Hindi B (Neural2)', locale: 'hi-IN' },
  { name: 'hi-IN-Neural2-C', label: 'Hindi C (Neural2)', locale: 'hi-IN' },
  { name: 'hi-IN-Neural2-D', label: 'Hindi D (Neural2)', locale: 'hi-IN' },
  { name: 'pl-PL-Wavenet-F', label: 'Polish F (WaveNet)', locale: 'pl-PL' },
  { name: 'pl-PL-Wavenet-G', label: 'Polish G (WaveNet)', locale: 'pl-PL' },
  { name: 'ko-KR-Neural2-A', label: 'Korean A (Neural2)', locale: 'ko-KR' },
  { name: 'ko-KR-Neural2-B', label: 'Korean B (Neural2)', locale: 'ko-KR' },
  { name: 'ko-KR-Neural2-C', label: 'Korean C (Neural2)', locale: 'ko-KR' },
]

export const DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME = 'en-US-Neural2-F'

function googleVoiceMatchesSiteLocale(voiceProfileLocale: string, site: Locale): boolean {
  const tag = voiceProfileLocale.toLowerCase()
  switch (site) {
    case 'en':
      return tag.startsWith('en-')
    case 'he':
      return tag.startsWith('he-')
    case 'es':
      return tag.startsWith('es-')
    case 'fr':
      return tag.startsWith('fr-')
    case 'de':
      return tag.startsWith('de-')
    case 'pt':
      return tag.startsWith('pt-')
    case 'ja':
      return tag.startsWith('ja-')
    case 'zh':
      return tag.startsWith('cmn-') || tag.startsWith('yue-')
    case 'ar':
      return tag.startsWith('ar-')
    case 'ru':
      return tag.startsWith('ru-')
    case 'hi':
      return tag.startsWith('hi-')
    case 'pl':
      return tag.startsWith('pl-')
    case 'ko':
      return tag.startsWith('ko-')
    default:
      return tag.startsWith('en-')
  }
}

/** Voices shown in the mock interview picker for the active site language. */
export function googleCloudTtsVoicesForSiteLocale(siteLocale: Locale): GoogleCloudTtsVoiceProfile[] {
  const list = GOOGLE_CLOUD_TTS_VOICES.filter((v) => googleVoiceMatchesSiteLocale(v.locale, siteLocale))
  if (list.length > 0) return list
  return GOOGLE_CLOUD_TTS_VOICES.filter((v) => googleVoiceMatchesSiteLocale(v.locale, 'en'))
}

export function defaultGoogleCloudTtsVoiceForLocale(siteLocale: Locale): string {
  const list = googleCloudTtsVoicesForSiteLocale(siteLocale)
  return list[0]?.name ?? DEFAULT_GOOGLE_CLOUD_TTS_VOICE_NAME
}

export function languageCodeFromGoogleVoiceName(voiceName: string): string {
  const parts = voiceName.split('-')
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`
  return 'en-US'
}
