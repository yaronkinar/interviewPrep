import Link from 'next/link'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import ScreenHeader from '../components/layout/ScreenHeader'
import ContentSection from '../components/layout/ContentSection'
import ExpandableCard from '../components/ExpandableCard'
import { PATH_FOR_PAGE } from '../routes'
import AngularCheatsheet from './AngularCheatsheet'
import AngularPlayground from './AngularPlayground'

export default function AngularHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const { home: h } = strings

  return (
    <div className="editorial-page">
      <ScreenHeader title={ui.pages.angularTitle} lead={ui.pages.angularHubLead} />
      <section className="editorial-panel">
        <ContentSection className="editorial-content">
          <div className="grid full react-page-cheatsheet-row">
            <ExpandableCard>
              <AngularCheatsheet />
            </ExpandableCard>
          </div>
          <div className="grid full">
            <ExpandableCard>
              <AngularPlayground />
            </ExpandableCard>
          </div>
          <p style={{ marginTop: '1rem' }}>
            <span className="card-desc" style={{ display: 'block', marginBottom: '0.5rem' }}>
              {h.cards.angular.body}
            </span>
            <Link
              className="home-card-link"
              href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('Angular')}`}
            >
              {strings.nav.questions} →
            </Link>
          </p>
        </ContentSection>
      </section>
    </div>
  )
}
