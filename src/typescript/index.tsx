import Link from 'next/link'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import ScreenHeader from '../components/layout/ScreenHeader'
import ContentSection from '../components/layout/ContentSection'
import ExpandableCard from '../components/ExpandableCard'
import { PATH_FOR_PAGE } from '../routes'
import TypeScriptCheatsheet from './TypeScriptCheatsheet'
import TsDiscriminatedUnionDemo from './TsDiscriminatedUnionDemo'
import VanillaTsPlayground from './VanillaTsPlayground'

export default function TypeScriptHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const { home: h } = strings

  return (
    <div className="editorial-page">
      <ScreenHeader title={ui.pages.typescriptTitle} lead={ui.pages.typescriptHubLead} />
      <section className="editorial-panel">
        <ContentSection className="editorial-content">
          <div className="grid full react-page-cheatsheet-row">
            <ExpandableCard>
              <TypeScriptCheatsheet />
            </ExpandableCard>
          </div>
          <div className="grid">
            <ExpandableCard>
              <TsDiscriminatedUnionDemo />
            </ExpandableCard>
          </div>
          <div className="grid full">
            <ExpandableCard>
              <VanillaTsPlayground />
            </ExpandableCard>
          </div>
          <p style={{ marginTop: '1rem' }}>
            <span className="card-desc" style={{ display: 'block', marginBottom: '0.5rem' }}>
              {h.cards.typescript.body}
            </span>
            <Link
              className="home-card-link"
              href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('TypeScript')}`}
            >
              {strings.nav.questions} →
            </Link>
          </p>
        </ContentSection>
      </section>
    </div>
  )
}
