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
