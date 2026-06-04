/** One row per `(userId, locale)` in `cvSelfIntros`; content follows the site's UI locale. */
export interface UserCvSelfIntro {
  userId: string
  /** Normalized UI locale (`en`, `he`, …). */
  locale: string
  markdown: string
  /** Last successful write server-side */
  savedAt: Date
}
