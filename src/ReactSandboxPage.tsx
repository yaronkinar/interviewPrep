import ChatReactPreview from './questions/ChatReactPreview'
import { useLocale } from './i18n/LocaleContext'
import { getUiStrings } from './i18n/uiStrings'
import ScreenHeader from './components/layout/ScreenHeader'
import ContentSection from './components/layout/ContentSection'

export default function ReactSandboxPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <div className="editorial-page editorial-page--sandbox">
      <ScreenHeader title={ui.pages.sandboxTitle} lead={ui.pages.sandboxLead} className="screen-header--stitch-sandbox" />
      <section className="editorial-panel editorial-panel--tight sandbox-code-shell">
        <ContentSection className="content-section--tight editorial-content">
          <div className="sandbox-page-body">
            <ChatReactPreview />
          </div>
        </ContentSection>
      </section>
    </div>
  )
}
