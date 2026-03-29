import UseFetchDemo from './UseFetchDemo'
import UseDebounceDemo from './UseDebounceDemo'
import UseCallbackDemo from './UseCallbackDemo'
import UseRefDemo from './UseRefDemo'
import LazyLoadThrottleDemo from './LazyLoadThrottleDemo'
import EventLoopDemo from './EventLoopDemo'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

export default function ReactPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <>
      <h1 className="page-title">{ui.pages.reactTitle}</h1>
      <div className="grid">
        <UseFetchDemo />
        <UseDebounceDemo />
        <UseCallbackDemo />
        <UseRefDemo />
        <LazyLoadThrottleDemo />
        <EventLoopDemo />
      </div>
    </>
  )
}
