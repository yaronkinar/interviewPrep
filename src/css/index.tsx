import CenterDivCard from './CenterDivCard'
import PositionCard from './PositionCard'
import BoxModelCard from './BoxModelCard'
import SpecificityCard from './SpecificityCard'
import TruncateTextCard from './TruncateTextCard'
import StackingContextCard from './StackingContextCard'
import DisplayCard from './DisplayCard'
import PseudoCard from './PseudoCard'
import MarginCollapseCard from './MarginCollapseCard'
import CssVarsCard from './CssVarsCard'
import ExpandableCard from '../components/ExpandableCard'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'

export default function CssPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)

  return (
    <div className="js-editorial js-editorial--stitch" dir="ltr">
      <header className="js-editorial-header">
        <div>
          <h1 className="js-editorial-title">{ui.pages.cssTitle}</h1>
          <p className="js-editorial-lead">
            Classic CSS interview questions with live previews next to the rule that produces them.
            Toggle the techniques to compare behaviour side by side.
          </p>
        </div>
      </header>

      <section className="js-editorial-panel">
        <div className="grid js-editorial-grid">
          <ExpandableCard><CenterDivCard /></ExpandableCard>
          <ExpandableCard><PositionCard /></ExpandableCard>
          <ExpandableCard><BoxModelCard /></ExpandableCard>
          <ExpandableCard><SpecificityCard /></ExpandableCard>
          <ExpandableCard><TruncateTextCard /></ExpandableCard>
          <ExpandableCard><StackingContextCard /></ExpandableCard>
          <ExpandableCard><DisplayCard /></ExpandableCard>
          <ExpandableCard><PseudoCard /></ExpandableCard>
          <ExpandableCard><MarginCollapseCard /></ExpandableCard>
          <ExpandableCard><CssVarsCard /></ExpandableCard>
        </div>
      </section>
    </div>
  )
}
