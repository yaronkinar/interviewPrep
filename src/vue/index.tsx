import Link from 'next/link'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import ScreenHeader from '../components/layout/ScreenHeader'
import ContentSection from '../components/layout/ContentSection'
import ExpandableCard from '../components/ExpandableCard'
import { PATH_FOR_PAGE } from '../routes'
import VueCheatsheet from './VueCheatsheet'
import VueCompositionPlayground from './VueCompositionPlayground'

export default function VueHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const { home: h } = strings

  return (
    <div className="editorial-page">
      <ScreenHeader title={ui.pages.vueTitle} lead={ui.pages.vueHubLead} />
      <section className="editorial-panel">
        <ContentSection className="editorial-content">
          <div className="grid full react-page-cheatsheet-row">
            <ExpandableCard>
              <VueCheatsheet />
            </ExpandableCard>
          </div>
          <div className="grid full">
            <ExpandableCard>
              <VueCompositionPlayground />
            </ExpandableCard>
          </div>
          <p style={{ marginTop: '1rem' }}>
            <span className="card-desc" style={{ display: 'block', marginBottom: '0.5rem' }}>
              {h.cards.vue.body}
            </span>
            <Link
              className="home-card-link"
              href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('Vue.js')}`}
            >
              {strings.nav.questions} →
            </Link>
          </p>
        </ContentSection>
      </section>
    </div>
  )
}
