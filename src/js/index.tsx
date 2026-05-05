'use client'

import { useMemo } from 'react'
import type { ComponentType } from 'react'
import {
  Cpu,
  FileText,
  Gauge,
  Images,
  ListFilter,
  SquareTerminal,
  Timer,
} from 'lucide-react'
import MemoizeCard from './MemoizeCard'
import DebounceCard from './DebounceCard'
import ThrottleCard from './ThrottleCard'
import LazyLoadCard from './LazyLoadCard'
import FindVsFilterCard from './FindVsFilterCard'
import Sandbox from './Sandbox'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import LearningPathStudioPage from '../components/stitch/LearningPathStudioPage'
import type { LearningPathModuleMeta } from '../components/stitch/learningPathTypes'

const DEMO_BY_ID: Record<string, ComponentType> = {
  debounce: DebounceCard,
  throttle: ThrottleCard,
  memoize: MemoizeCard,
  lazyLoad: LazyLoadCard,
  findVsFilter: FindVsFilterCard,
  sandbox: Sandbox,
}

export default function JsPage() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio
  const tip = ui.topicStudios.js

  const modules = useMemo((): LearningPathModuleMeta[] => {
    const u = getUiStrings(locale)
    const j = u.js
    return [
      {
        id: 'debounce',
        difficulty: 'easy',
        status: 'mastered',
        progress: 100,
        title: j.debounce.title,
        description: j.debounce.description.replace('{delay}', '300'),
        Icon: Timer,
      },
      {
        id: 'throttle',
        difficulty: 'medium',
        status: 'in_progress',
        progress: 55,
        title: j.throttle.title,
        description: j.throttle.description.replace('{delay}', '120'),
        Icon: Gauge,
      },
      {
        id: 'memoize',
        difficulty: 'medium',
        status: 'in_progress',
        progress: 40,
        title: j.memoize.title,
        description: j.memoize.description,
        Icon: Cpu,
      },
      {
        id: 'lazyLoad',
        difficulty: 'hard',
        status: 'not_started',
        progress: 5,
        title: j.lazy.title,
        description: j.lazy.description,
        Icon: Images,
      },
      {
        id: 'findVsFilter',
        difficulty: 'easy',
        status: 'mastered',
        progress: 100,
        title: 'find() vs filter()',
        description: 'Linear scan vs building a new array — Big-O and early-exit behaviour in interviews.',
        Icon: ListFilter,
      },
      {
        id: 'sandbox',
        difficulty: 'medium',
        status: 'not_started',
        progress: 0,
        title: j.sandbox.title,
        description: j.sandbox.description,
        Icon: SquareTerminal,
      },
    ]
  }, [locale])

  return (
    <LearningPathStudioPage
      pageTitle={ui.pages.jsTitle}
      pageLead={ui.pages.jsHubLead}
      modules={modules}
      demoById={DEMO_BY_ID}
      examplesScrollId="lp-js-debounce"
      examplesModuleId="debounce"
      proTipTitle={tip.proTipTitle}
      proTipBody={tip.proTipBody}
      viewExamplesLabel={tip.viewExamples}
      headerAside={
        <div className="js-editorial-actions">
          <button type="button" className="secondary js-editorial-btn">
            Export Lab
          </button>
          <button type="button" className="js-editorial-btn js-editorial-btn--primary">
            Share Workspace
          </button>
        </div>
      }
      resources={[
        {
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference',
          external: true,
          title: 'MDN — JavaScript',
          sub: 'Language reference',
          Icon: FileText,
        },
        {
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          external: true,
          title: 'MDN — JS Guide',
          sub: 'Concepts & syntax',
          Icon: FileText,
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
