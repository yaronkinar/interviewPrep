import UseFetchDemo from './UseFetchDemo'
import UseDebounceDemo from './UseDebounceDemo'
import UseCallbackDemo from './UseCallbackDemo'
import UseRefDemo from './UseRefDemo'
import LazyLoadThrottleDemo from './LazyLoadThrottleDemo'
import EventLoopDemo from './EventLoopDemo'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import ScreenHeader from '../components/layout/ScreenHeader'
import ContentSection from '../components/layout/ContentSection'

export default function ReactPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <div className="editorial-page">
      <ScreenHeader title={ui.pages.reactTitle} />
      <section className="editorial-panel">
        <ContentSection className="editorial-content">
          <div className="grid">
            <UseFetchDemo />
            <UseDebounceDemo />
            <UseCallbackDemo />
            <UseRefDemo />
            <LazyLoadThrottleDemo />
            <EventLoopDemo />
          </div>
        </ContentSection>
      </section>
    </div>
  )
}
