import MemoizeCard from './MemoizeCard'
import DebounceCard from './DebounceCard'
import ThrottleCard from './ThrottleCard'
import LazyLoadCard from './LazyLoadCard'
import Sandbox from './Sandbox'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

export default function JsPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <>
      <h1 className="page-title">{ui.pages.jsTitle}</h1>
      <div className="grid">
        <MemoizeCard />
        <DebounceCard />
        <ThrottleCard />
        <LazyLoadCard />
      </div>
      <div style={{ maxWidth: 1200, margin: '1.5rem auto 0' }}>
        <div className="grid full">
          <Sandbox />
        </div>
      </div>
    </>
  )
}
