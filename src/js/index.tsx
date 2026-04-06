import MemoizeCard from './MemoizeCard'
import DebounceCard from './DebounceCard'
import ThrottleCard from './ThrottleCard'
import LazyLoadCard from './LazyLoadCard'
import Sandbox from './Sandbox'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import ExpandableCard from '../components/ExpandableCard'

export default function JsPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <div className="js-editorial js-editorial--stitch" dir="ltr">
      <header className="js-editorial-header">
        <div>
          <h1 className="js-editorial-title">{ui.pages.jsTitle}</h1>
          <p className="js-editorial-lead">
            Learn by tweaking values and watching runtime behavior. A curated sandbox for the modern engineer.
          </p>
        </div>
        <div className="js-editorial-actions">
          <button type="button" className="secondary js-editorial-btn">Export Lab</button>
          <button type="button" className="js-editorial-btn js-editorial-btn--primary">Share Workspace</button>
        </div>
      </header>

      <section className="js-editorial-panel">
        <div className="grid js-editorial-grid">
          <ExpandableCard><DebounceCard /></ExpandableCard>
          <ExpandableCard><ThrottleCard /></ExpandableCard>
          <ExpandableCard><MemoizeCard /></ExpandableCard>
          <ExpandableCard><LazyLoadCard /></ExpandableCard>
        </div>
      </section>

      <section className="js-editorial-panel js-editorial-panel--sandbox">
        <div className="grid full js-editorial-sandbox-wrap">
          <ExpandableCard><Sandbox /></ExpandableCard>
        </div>
      </section>
    </div>
  )
}
