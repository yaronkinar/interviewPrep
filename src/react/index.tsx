'use client'

import type { ComponentType } from 'react'
import { FileText, PlayCircle, SquareTerminal } from 'lucide-react'
import ReactCheatsheet from './ReactCheatsheet'
import UseFetchDemo from './UseFetchDemo'
import UseDebounceDemo from './UseDebounceDemo'
import UseCallbackDemo from './UseCallbackDemo'
import UseRefDemo from './UseRefDemo'
import LazyLoadThrottleDemo from './LazyLoadThrottleDemo'
import EventLoopDemo from './EventLoopDemo'
import DropdownPortalDemo from './DropdownPortalDemo'
import { REACT_PATTERN_MODULES } from './reactPatternModules'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import LearningPathStudioPage from '../components/stitch/LearningPathStudioPage'

const DEMO_BY_ID: Record<string, ComponentType> = {
  cheatsheet: ReactCheatsheet,
  useFetch: UseFetchDemo,
  useDebounce: UseDebounceDemo,
  useCallback: UseCallbackDemo,
  useRef: UseRefDemo,
  lazyThrottle: LazyLoadThrottleDemo,
  eventLoop: EventLoopDemo,
  dropdownPortal: DropdownPortalDemo,
}

export default function ReactPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio
  const tip = ui.topicStudios.react

  return (
    <LearningPathStudioPage
      pageTitle={ui.pages.reactTitle}
      pageLead={ui.pages.reactHubLead}
      modules={REACT_PATTERN_MODULES}
      demoById={DEMO_BY_ID}
      examplesScrollId="lp-react-cheatsheet"
      examplesModuleId="cheatsheet"
      proTipTitle={tip.proTipTitle}
      proTipBody={tip.proTipBody}
      viewExamplesLabel={tip.viewExamples}
      resources={[
        {
          href: 'https://react.dev/learn',
          external: true,
          title: 'Official React docs',
          sub: 'Learn React',
          Icon: FileText,
        },
        {
          href: 'https://react.dev/learn/thinking-in-react',
          external: true,
          title: 'Thinking in React',
          sub: 'Official tutorial',
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
