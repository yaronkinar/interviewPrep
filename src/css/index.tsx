'use client'

import type { ComponentType } from 'react'
import {
  AlignCenter,
  ArrowDownUp,
  Asterisk,
  BoxSelect,
  Ellipsis,
  FileText,
  Layers,
  LayoutGrid,
  Move,
  PlayCircle,
  Shield,
  SquareTerminal,
  Variable,
} from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import LearningPathStudioPage from '../components/stitch/LearningPathStudioPage'
import type { LearningPathModuleMeta } from '../components/stitch/learningPathTypes'
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

const DEMO_BY_ID: Record<string, ComponentType> = {
  centerDiv: CenterDivCard,
  position: PositionCard,
  boxModel: BoxModelCard,
  specificity: SpecificityCard,
  truncate: TruncateTextCard,
  stacking: StackingContextCard,
  display: DisplayCard,
  pseudo: PseudoCard,
  marginCollapse: MarginCollapseCard,
  cssVars: CssVarsCard,
}

const CSS_MODULES: LearningPathModuleMeta[] = [
  {
    id: 'centerDiv',
    difficulty: 'easy',
    status: 'mastered',
    progress: 100,
    title: 'Center a div without flex or grid',
    description: 'Classic positioning tricks interviewers still love — know when translate vs auto margins wins.',
    Icon: AlignCenter,
  },
  {
    id: 'position',
    difficulty: 'easy',
    status: 'in_progress',
    progress: 55,
    title: 'CSS position values',
    description: 'static, relative, absolute, fixed, sticky — containing blocks and scroll behaviour.',
    Icon: Move,
  },
  {
    id: 'boxModel',
    difficulty: 'medium',
    status: 'in_progress',
    progress: 48,
    title: 'Box model: content-box vs border-box',
    description: 'Explain rendered width when padding and borders join the party.',
    Icon: BoxSelect,
  },
  {
    id: 'specificity',
    difficulty: 'medium',
    status: 'not_started',
    progress: 20,
    title: 'Specificity: which rule wins?',
    description: 'IDs, classes, inline styles, !important — tie-break order without guessing.',
    Icon: Shield,
  },
  {
    id: 'truncate',
    difficulty: 'easy',
    status: 'mastered',
    progress: 100,
    title: 'Truncate text with an ellipsis',
    description: 'overflow, white-space, text-overflow — plus flexGotchas.',
    Icon: Ellipsis,
  },
  {
    id: 'stacking',
    difficulty: 'hard',
    status: 'in_progress',
    progress: 30,
    title: 'Stacking context & z-index traps',
    description: 'Why z-index: 9999 sometimes loses — opacity, transforms, and isolation.',
    Icon: Layers,
  },
  {
    id: 'display',
    difficulty: 'medium',
    status: 'not_started',
    progress: 15,
    title: 'Display values & hiding elements',
    description: 'none vs visibility vs opacity vs off-screen patterns for accessibility.',
    Icon: LayoutGrid,
  },
  {
    id: 'pseudo',
    difficulty: 'easy',
    status: 'mastered',
    progress: 100,
    title: 'Pseudo-class vs pseudo-element',
    description: ':hover vs ::before — syntax, specificity hooks, and interview narrations.',
    Icon: Asterisk,
  },
  {
    id: 'marginCollapse',
    difficulty: 'hard',
    status: 'not_started',
    progress: 8,
    title: 'Vertical margin collapsing',
    description: 'Adjacent siblings, empty blocks, and padding hacks that reset collapse.',
    Icon: ArrowDownUp,
  },
  {
    id: 'cssVars',
    difficulty: 'medium',
    status: 'in_progress',
    progress: 42,
    title: 'CSS custom properties (variables)',
    description: 'Theme tokens, inheritance, fallbacks, and runtime updates vs preprocessor vars.',
    Icon: Variable,
  },
]

export default function CssPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio
  const tip = ui.topicStudios.css

  return (
    <LearningPathStudioPage
      pageTitle={ui.pages.cssTitle}
      pageLead={ui.pages.cssHubLead}
      modules={CSS_MODULES}
      demoById={DEMO_BY_ID}
      examplesScrollId="lp-css-centerDiv"
      examplesModuleId="centerDiv"
      proTipTitle={tip.proTipTitle}
      proTipBody={tip.proTipBody}
      viewExamplesLabel={tip.viewExamples}
      resources={[
        {
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
          external: true,
          title: 'MDN — CSS',
          sub: 'Reference',
          Icon: FileText,
        },
        {
          href: 'https://web.dev/learn/css/',
          external: true,
          title: 'web.dev — Learn CSS',
          sub: 'Guided modules',
          Icon: PlayCircle,
        },
        {
          href: '/sandbox',
          external: false,
          title: lp.sandboxLinkTitle,
          sub: lp.sandboxLinkSub,
          Icon: SquareTerminal,
        },
      ]}
    />
  )
}
