import UseFetchDemo from './UseFetchDemo'
import UseDebounceDemo from './UseDebounceDemo'
import UseCallbackDemo from './UseCallbackDemo'
import UseRefDemo from './UseRefDemo'
import LazyLoadThrottleDemo from './LazyLoadThrottleDemo'
import EventLoopDemo from './EventLoopDemo'
import DropdownPortalDemo from './DropdownPortalDemo'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import ScreenHeader from '../components/layout/ScreenHeader'
import ContentSection from '../components/layout/ContentSection'
import ExpandableCard from '../components/ExpandableCard'

export default function ReactPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <div className="editorial-page">
      <ScreenHeader title={ui.pages.reactTitle} />
      <section className="editorial-panel">
        <ContentSection className="editorial-content">
          <div className="grid">
            <ExpandableCard><UseFetchDemo /></ExpandableCard>
            <ExpandableCard><UseDebounceDemo /></ExpandableCard>
            <ExpandableCard><UseCallbackDemo /></ExpandableCard>
            <ExpandableCard><UseRefDemo /></ExpandableCard>
            <ExpandableCard><LazyLoadThrottleDemo /></ExpandableCard>
            <ExpandableCard><EventLoopDemo /></ExpandableCard>
            <ExpandableCard><DropdownPortalDemo /></ExpandableCard>
          </div>
        </ContentSection>
      </section>
    </div>
  )
}
