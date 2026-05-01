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
  /** Display persona for interviewer UI (avatar + name). */
  persona: string
  /** Persona presentation for matching senior-manager portrait art. */
  avatarGender: 'male' | 'female'
}

export const GOOGLE_CLOUD_TTS_VOICES: GoogleCloudTtsVoiceProfile[] = [
  { name: 'en-US-Neural2-F', label: 'Rachel (US, Neural2)', locale: 'en-US', persona: 'Morgan Ellis', avatarGender: 'female' },
  { name: 'en-US-Neural2-C', label: 'US English C (Neural2)', locale: 'en-US', persona: 'Casey Nguyen', avatarGender: 'female' },
  { name: 'en-US-Neural2-E', label: 'US English E (Neural2)', locale: 'en-US', persona: 'Eden Brooks', avatarGender: 'female' },
  { name: 'en-US-Neural2-G', label: 'US English G (Neural2)', locale: 'en-US', persona: 'Gray Monroe', avatarGender: 'male' },
  { name: 'en-US-Neural2-H', label: 'US English H (Neural2)', locale: 'en-US', persona: 'Harper Quinn', avatarGender: 'female' },
  { name: 'en-US-Neural2-J', label: 'US English J (Neural2)', locale: 'en-US', persona: 'Jules Parker', avatarGender: 'male' },
  { name: 'en-US-Neural2-A', label: 'US English A (Neural2)', locale: 'en-US', persona: 'Avery Cole', avatarGender: 'male' },
  { name: 'en-US-Neural2-D', label: 'US English D (Neural2)', locale: 'en-US', persona: 'Dakota Wells', avatarGender: 'male' },
  { name: 'en-GB-Neural2-A', label: 'UK English A (Neural2)', locale: 'en-GB', persona: 'Oliver Tate', avatarGender: 'male' },
  { name: 'en-GB-Neural2-B', label: 'UK English B (Neural2)', locale: 'en-GB', persona: 'Imogen Hart', avatarGender: 'female' },
  { name: 'en-GB-Neural2-C', label: 'UK English C (Neural2)', locale: 'en-GB', persona: 'Charlotte Grey', avatarGender: 'female' },
  { name: 'en-AU-Neural2-A', label: 'Australian A (Neural2)', locale: 'en-AU', persona: 'Riley Clarke', avatarGender: 'female' },
  { name: 'en-AU-Neural2-B', label: 'Australian B (Neural2)', locale: 'en-AU', persona: 'Max Sullivan', avatarGender: 'male' },
  { name: 'he-IL-Wavenet-A', label: 'Hebrew A (WaveNet)', locale: 'he-IL', persona: 'Noa Ben-Ari', avatarGender: 'female' },
  { name: 'he-IL-Wavenet-B', label: 'Hebrew B (WaveNet)', locale: 'he-IL', persona: 'Yael Cohen', avatarGender: 'female' },
  { name: 'he-IL-Wavenet-C', label: 'Hebrew C (WaveNet)', locale: 'he-IL', persona: 'Omer Levi', avatarGender: 'male' },
  { name: 'he-IL-Wavenet-D', label: 'Hebrew D (WaveNet)', locale: 'he-IL', persona: 'Tal Mizrahi', avatarGender: 'female' },
  { name: 'es-ES-Neural2-A', label: 'Spanish (Spain) A (Neural2)', locale: 'es-ES', persona: 'Carmen Vidal', avatarGender: 'female' },
  { name: 'es-ES-Neural2-E', label: 'Spanish (Spain) E (Neural2)', locale: 'es-ES', persona: 'Lucía Ortega', avatarGender: 'female' },
  { name: 'es-ES-Neural2-F', label: 'Spanish (Spain) F (Neural2)', locale: 'es-ES', persona: 'Diego Navarro', avatarGender: 'male' },
  { name: 'es-ES-Neural2-G', label: 'Spanish (Spain) G (Neural2)', locale: 'es-ES', persona: 'Sofía Mendez', avatarGender: 'female' },
  { name: 'es-ES-Neural2-H', label: 'Spanish (Spain) H (Neural2)', locale: 'es-ES', persona: 'Javier Ríos', avatarGender: 'male' },
  { name: 'es-US-Neural2-A', label: 'Spanish (US) A (Neural2)', locale: 'es-US', persona: 'Mateo Reyes', avatarGender: 'male' },
  { name: 'es-US-Neural2-B', label: 'Spanish (US) B (Neural2)', locale: 'es-US', persona: 'Luna Herrera', avatarGender: 'female' },
  { name: 'es-US-Neural2-C', label: 'Spanish (US) C (Neural2)', locale: 'es-US', persona: 'Valentina Cruz', avatarGender: 'female' },
  { name: 'fr-FR-Neural2-F', label: 'French F (Neural2)', locale: 'fr-FR', persona: 'Amélie Rousseau', avatarGender: 'female' },
  { name: 'fr-FR-Neural2-G', label: 'French G (Neural2)', locale: 'fr-FR', persona: 'Julien Moreau', avatarGender: 'male' },
  { name: 'de-DE-Neural2-G', label: 'German G (Neural2)', locale: 'de-DE', persona: 'Greta Weiss', avatarGender: 'female' },
  { name: 'de-DE-Neural2-H', label: 'German H (Neural2)', locale: 'de-DE', persona: 'Felix Brandt', avatarGender: 'male' },
  { name: 'pt-BR-Neural2-A', label: 'Portuguese (Brazil) A (Neural2)', locale: 'pt-BR', persona: 'Rafael Souza', avatarGender: 'male' },
  { name: 'pt-BR-Neural2-B', label: 'Portuguese (Brazil) B (Neural2)', locale: 'pt-BR', persona: 'Marina Costa', avatarGender: 'female' },
  { name: 'pt-BR-Neural2-C', label: 'Portuguese (Brazil) C (Neural2)', locale: 'pt-BR', persona: 'Lucia Ferreira', avatarGender: 'female' },
  { name: 'ja-JP-Neural2-B', label: 'Japanese B (Neural2)', locale: 'ja-JP', persona: 'Kenji Morita', avatarGender: 'male' },
  { name: 'ja-JP-Neural2-C', label: 'Japanese C (Neural2)', locale: 'ja-JP', persona: 'Yuki Tanaka', avatarGender: 'male' },
  { name: 'ja-JP-Neural2-D', label: 'Japanese D (Neural2)', locale: 'ja-JP', persona: 'Hana Saito', avatarGender: 'female' },
  { name: 'cmn-CN-Wavenet-A', label: 'Mandarin A (WaveNet)', locale: 'cmn-CN', persona: 'Wei Zhang', avatarGender: 'male' },
  { name: 'cmn-CN-Wavenet-B', label: 'Mandarin B (WaveNet)', locale: 'cmn-CN', persona: 'Lin Zhou', avatarGender: 'female' },
  { name: 'cmn-CN-Wavenet-C', label: 'Mandarin C (WaveNet)', locale: 'cmn-CN', persona: 'Chen Wu', avatarGender: 'male' },
  { name: 'cmn-CN-Wavenet-D', label: 'Mandarin D (WaveNet)', locale: 'cmn-CN', persona: 'Yan Liu', avatarGender: 'female' },
  { name: 'ar-XA-Wavenet-A', label: 'Arabic A (WaveNet)', locale: 'ar-XA', persona: 'Layla Haddad', avatarGender: 'female' },
  { name: 'ar-XA-Wavenet-B', label: 'Arabic B (WaveNet)', locale: 'ar-XA', persona: 'Omar Said', avatarGender: 'male' },
  { name: 'ar-XA-Wavenet-C', label: 'Arabic C (WaveNet)', locale: 'ar-XA', persona: 'Nadia Karim', avatarGender: 'female' },
  { name: 'ar-XA-Wavenet-D', label: 'Arabic D (WaveNet)', locale: 'ar-XA', persona: 'Karim Fayed', avatarGender: 'male' },
  { name: 'ru-RU-Wavenet-A', label: 'Russian A (WaveNet)', locale: 'ru-RU', persona: 'Ivan Petrov', avatarGender: 'male' },
  { name: 'ru-RU-Wavenet-B', label: 'Russian B (WaveNet)', locale: 'ru-RU', persona: 'Natasha Volkov', avatarGender: 'female' },
  { name: 'ru-RU-Wavenet-C', label: 'Russian C (WaveNet)', locale: 'ru-RU', persona: 'Dmitri Kozlov', avatarGender: 'male' },
  { name: 'ru-RU-Wavenet-D', label: 'Russian D (WaveNet)', locale: 'ru-RU', persona: 'Katya Smirnova', avatarGender: 'female' },
  { name: 'ru-RU-Wavenet-E', label: 'Russian E (WaveNet)', locale: 'ru-RU', persona: 'Pavel Ivanov', avatarGender: 'male' },
  { name: 'hi-IN-Neural2-A', label: 'Hindi A (Neural2)', locale: 'hi-IN', persona: 'Priya Sharma', avatarGender: 'female' },
  { name: 'hi-IN-Neural2-B', label: 'Hindi B (Neural2)', locale: 'hi-IN', persona: 'Arjun Mehta', avatarGender: 'male' },
  { name: 'hi-IN-Neural2-C', label: 'Hindi C (Neural2)', locale: 'hi-IN', persona: 'Ananya Kapoor', avatarGender: 'female' },
  { name: 'hi-IN-Neural2-D', label: 'Hindi D (Neural2)', locale: 'hi-IN', persona: 'Vikram Singh', avatarGender: 'male' },
  { name: 'pl-PL-Wavenet-F', label: 'Polish F (WaveNet)', locale: 'pl-PL', persona: 'Zosia Kowalska', avatarGender: 'female' },
  { name: 'pl-PL-Wavenet-G', label: 'Polish G (WaveNet)', locale: 'pl-PL', persona: 'Marek Nowak', avatarGender: 'male' },
  { name: 'ko-KR-Neural2-A', label: 'Korean A (Neural2)', locale: 'ko-KR', persona: 'Min-soo Park', avatarGender: 'male' },
  { name: 'ko-KR-Neural2-B', label: 'Korean B (Neural2)', locale: 'ko-KR', persona: 'Ji-eun Kim', avatarGender: 'female' },
  { name: 'ko-KR-Neural2-C', label: 'Korean C (Neural2)', locale: 'ko-KR', persona: 'Hana Lee', avatarGender: 'female' },
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
