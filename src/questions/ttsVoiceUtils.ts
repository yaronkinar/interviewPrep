/**
 * Browsers do not expose voice gender in a standard way. We use name/lang heuristics
 * so users can get a woman-sounding voice when one is available (varies by OS).
 */
const FEMALE_HINTS =
  /\b(female|woman|girl|zira|aria|samantha|karen|moira|tessa|fiona|victoria|susan|hazel|sonia|emma|jenny|sarah|joanna|ivy|kimberly|linda|michelle|heather|olivia|catherine|allison|serena|veena|swara|paola|ines|laura|nora|lea|amelie|ines)\b/i

const MALE_HINTS =
  /\b(male|man|david|mark|fred|daniel|thomas|richard|tony|george|james|john|alex\b|bruce|aaron|guy)\b/i

function femaleScore(v: SpeechSynthesisVoice): number {
  const n = `${v.name} ${v.voiceURI}`
  if (MALE_HINTS.test(n)) return -2
  if (FEMALE_HINTS.test(n)) return 2
  if (/female/i.test(n)) return 2
  if (/-F\b|_F\b|\(F\)|\sF$/i.test(n)) return 1
  return 0
}

function maleScore(v: SpeechSynthesisVoice): number {
  const n = `${v.name} ${v.voiceURI}`
  if (FEMALE_HINTS.test(n)) return -2
  if (MALE_HINTS.test(n)) return 2
  if (/male/i.test(n)) return 2
  if (/-M\b|_M\b|\(M\)|\sM$/i.test(n)) return 1
  return 0
}

/** Best-effort pick for a woman voice matching the user's locale first. */
export function pickFemaleVoice(
  voices: SpeechSynthesisVoice[],
  localeHint: string,
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined
  const lang = localeHint.toLowerCase()
  const short = lang.split('-')[0] ?? lang

  const scored = voices.map((v) => ({
    v,
    s: femaleScore(v) + (v.lang.toLowerCase().startsWith(lang) ? 0.5 : 0) + (v.lang.toLowerCase().startsWith(short) ? 0.25 : 0),
  }))
  scored.sort((a, b) => b.s - a.s)
  const best = scored[0]
  if (best.s >= 1) return best.v

  const inLocale = voices.filter(
    (v) => v.lang.toLowerCase().startsWith(lang) || v.lang.toLowerCase().startsWith(short),
  )
  for (const v of inLocale) {
    if (femaleScore(v) >= 1) return v
  }
  return undefined
}

export function labelVoiceOption(v: SpeechSynthesisVoice, likelyFemale: boolean): string {
  const base = `${v.name} (${v.lang})${v.default ? ' — default' : ''}`
  return likelyFemale ? `${base} — woman` : base
}

export function isLikelyFemaleVoice(v: SpeechSynthesisVoice): boolean {
  return femaleScore(v) >= 1
}

export function isLikelyMaleVoice(v: SpeechSynthesisVoice): boolean {
  return maleScore(v) >= 1
}

export type VoiceAvatarGender = 'female' | 'male' | 'unknown'

/** Best-effort gender for browser/system TTS voices (for portrait matching). */
export function inferBrowserVoiceGender(v: SpeechSynthesisVoice): VoiceAvatarGender {
  if (isLikelyFemaleVoice(v)) return 'female'
  if (isLikelyMaleVoice(v)) return 'male'
  return 'unknown'
}

/**
 * On-brand senior-manager portraits (`public/voice-avatars/`). File indices match
 * generated art: female = 01,04,05,09,10,11 — male = 02,03,06,07,08,12.
 */
function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

const FEMALE_SENIOR_MANAGER_AVATAR_URLS: string[] = [1, 4, 5, 9, 10, 11].map(
  (i) => `/voice-avatars/voice-mock-interviewer-${pad2(i)}.webp`,
)
const MALE_SENIOR_MANAGER_AVATAR_URLS: string[] = [2, 3, 6, 7, 8, 12].map(
  (i) => `/voice-avatars/voice-mock-interviewer-${pad2(i)}.webp`,
)
const ALL_SENIOR_MANAGER_AVATAR_URLS: string[] = Array.from({ length: 12 }, (_, i) =>
  `/voice-avatars/voice-mock-interviewer-${pad2(i + 1)}.webp`,
)

function stablePortraitIndex(seed: string, len: number): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % len
}

/**
 * Deterministic senior-manager portrait for a voice persona.
 * Pass `avatarGender` so the face matches the displayed name when known.
 */
export function avatarUrlForVoiceSeed(seed: string, avatarGender: VoiceAvatarGender = 'unknown'): string {
  if (avatarGender === 'female' && FEMALE_SENIOR_MANAGER_AVATAR_URLS.length > 0) {
    const list = FEMALE_SENIOR_MANAGER_AVATAR_URLS
    return list[stablePortraitIndex(seed, list.length)]
  }
  if (avatarGender === 'male' && MALE_SENIOR_MANAGER_AVATAR_URLS.length > 0) {
    const list = MALE_SENIOR_MANAGER_AVATAR_URLS
    return list[stablePortraitIndex(seed, list.length)]
  }
  const list = ALL_SENIOR_MANAGER_AVATAR_URLS
  if (list.length === 0) return ''
  return list[stablePortraitIndex(seed, list.length)]
}

/**
 * Best-effort default voice for interview playback:
 * 1) locale-matching woman voice (if available)
 * 2) locale-matching default/system voice
 * 3) any default voice
 * 4) first available voice
 */
export function pickBestInterviewVoice(
  voices: SpeechSynthesisVoice[],
  localeHint: string,
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined
  const lang = localeHint.toLowerCase()
  const short = lang.split('-')[0] ?? lang

  const woman = pickFemaleVoice(voices, localeHint)
  if (woman) return woman

  const inLocale = voices.filter(
    (v) => v.lang.toLowerCase().startsWith(lang) || v.lang.toLowerCase().startsWith(short),
  )
  const localeDefault = inLocale.find((v) => v.default)
  if (localeDefault) return localeDefault
  if (inLocale.length > 0) return inLocale[0]

  const anyDefault = voices.find((v) => v.default)
  if (anyDefault) return anyDefault
  return voices[0]
}
