'use client'

import Link from 'next/link'
import TopicHubShell from '@/components/stitch/TopicHubShell'
import { useLocale } from '@/i18n/LocaleContext'
import { getUiStrings } from '@/i18n/uiStrings'
import { PATH_FOR_PAGE } from '@/routes'
import FullStackTopics from './FullStackTopics'

export default function FullStackHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const { nav } = strings

  return (
    <TopicHubShell
      kicker="Topic hub"
      title={ui.pages.fullstackTitle}
      lead={ui.pages.fullstackHubLead}
    >
      <FullStackTopics />
      <p className="topic-hub-footer-link" style={{ marginTop: '1.75rem' }}>
        <Link className="home-card-link" href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('Full Stack')}`}>
          {nav.questions} →
        </Link>
      </p>
    </TopicHubShell>
  )
}
