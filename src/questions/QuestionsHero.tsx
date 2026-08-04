'use client'

import { Terminal } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

/**
 * The `/questions` hero, kept out of `QuestionsPage`.
 *
 * `QuestionsPage` calls `useSearchParams`, which makes Next bail its whole
 * Suspense boundary out to client rendering — so anything inside it, including
 * the page's `h1`, is missing from the prerendered HTML. This component only
 * needs the locale, so rendering it outside that boundary puts the heading in
 * the served markup while still hydrating into the reader's language.
 */
export default function QuestionsHero() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <header className="questions-stitch-hero">
      <div className="questions-stitch-hero-primary">
        <div className="questions-stitch-kicker">
          <Terminal className="questions-stitch-kicker-icon" size={16} strokeWidth={2} aria-hidden />
          {ui.questions.heroKicker}
        </div>
        <h1 className="questions-stitch-hero-title">
          {ui.questions.heroTitleLine1}
          <br />
          <span className="questions-stitch-hero-accent">{ui.pages.questionsTitle}</span>
        </h1>
      </div>
      <p className="questions-stitch-hero-lead">{ui.questions.heroLead}</p>
    </header>
  )
}
