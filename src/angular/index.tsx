import Link from 'next/link'
import type { ComponentType } from 'react'
import { BookOpen, Code2, FileText, PlayCircle, SquareTerminal } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import { PATH_FOR_PAGE } from '../routes'
import LearningPathStudioPage from '../components/stitch/LearningPathStudioPage'
import type { LearningPathModuleMeta } from '../components/stitch/learningPathTypes'
import AngularCheatsheet from './AngularCheatsheet'
import AngularPlayground from './AngularPlayground'

const DEMO_BY_ID: Record<string, ComponentType> = {
  cheatsheet: AngularCheatsheet,
  playground: AngularPlayground,
}

const ANGULAR_MODULES: LearningPathModuleMeta[] = [
  {
    id: 'cheatsheet',
    difficulty: 'medium',
    status: 'in_progress',
    progress: 38,
    title: 'Angular cheatsheet',
    description: 'Components, DI tokens, pipes, directives, and change-detection vocabulary for interviews.',
    Icon: BookOpen,
  },
  {
    id: 'playground',
    difficulty: 'hard',
    status: 'not_started',
    progress: 12,
    title: 'Angular playground',
    description: 'Experiment with decorators, modules, and templates — explain bootstrapping trade-offs.',
    Icon: Code2,
  },
]

export default function AngularHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio
  const tip = ui.topicStudios.angular
  const { home: h, nav } = strings

  return (
    <LearningPathStudioPage
      pageTitle={ui.pages.angularTitle}
      pageLead={ui.pages.angularHubLead}
      modules={ANGULAR_MODULES}
      demoById={DEMO_BY_ID}
      examplesScrollId="lp-ng-cheatsheet"
      examplesModuleId="cheatsheet"
      proTipTitle={tip.proTipTitle}
      proTipBody={tip.proTipBody}
      viewExamplesLabel={tip.viewExamples}
      resources={[
        {
          href: 'https://angular.dev/overview',
          external: true,
          title: 'Angular docs',
          sub: 'Official overview',
          Icon: FileText,
        },
        {
          href: 'https://angular.dev/tutorials',
          external: true,
          title: 'Tutorials',
          sub: 'Hands-on guides',
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
      footerSlot={
        <p className="topic-hub-footer-link">
          <span className="card-desc topic-hub-footer-copy">{h.cards.angular.body}</span>
          <Link className="home-card-link" href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('Angular')}`}>
            {nav.questions} →
          </Link>
        </p>
      }
    />
  )
}
