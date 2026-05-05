import Link from 'next/link'
import type { ComponentType } from 'react'
import { BookOpen, FileText, Layers, PlayCircle, SquareTerminal } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import { PATH_FOR_PAGE } from '../routes'
import LearningPathStudioPage from '../components/stitch/LearningPathStudioPage'
import type { LearningPathModuleMeta } from '../components/stitch/learningPathTypes'
import VueCheatsheet from './VueCheatsheet'
import VueCompositionPlayground from './VueCompositionPlayground'

const DEMO_BY_ID: Record<string, ComponentType> = {
  cheatsheet: VueCheatsheet,
  composition: VueCompositionPlayground,
}

const VUE_MODULES: LearningPathModuleMeta[] = [
  {
    id: 'cheatsheet',
    difficulty: 'easy',
    status: 'in_progress',
    progress: 40,
    title: 'Vue cheatsheet',
    description: 'Options vs Composition API at a glance — refs, lifecycle hooks, and slots vocabulary.',
    Icon: BookOpen,
  },
  {
    id: 'composition',
    difficulty: 'medium',
    status: 'not_started',
    progress: 15,
    title: 'Composition API playground',
    description: 'Wire reactive state and lifecycle in the browser — narrate script setup ergonomics.',
    Icon: Layers,
  },
]

export default function VueHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio
  const tip = ui.topicStudios.vue
  const { home: h, nav } = strings

  return (
    <LearningPathStudioPage
      pageTitle={ui.pages.vueTitle}
      pageLead={ui.pages.vueHubLead}
      modules={VUE_MODULES}
      demoById={DEMO_BY_ID}
      examplesScrollId="lp-vue-cheatsheet"
      examplesModuleId="cheatsheet"
      proTipTitle={tip.proTipTitle}
      proTipBody={tip.proTipBody}
      viewExamplesLabel={tip.viewExamples}
      resources={[
        {
          href: 'https://vuejs.org/guide/introduction.html',
          external: true,
          title: 'Vue — Official guide',
          sub: 'Framework basics',
          Icon: FileText,
        },
        {
          href: 'https://play.vuejs.org/',
          external: true,
          title: 'Vue playground',
          sub: 'Try SFCs online',
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
          <span className="card-desc topic-hub-footer-copy">{h.cards.vue.body}</span>
          <Link className="home-card-link" href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('Vue.js')}`}>
            {nav.questions} →
          </Link>
        </p>
      }
    />
  )
}
