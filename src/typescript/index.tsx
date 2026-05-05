import Link from 'next/link'
import type { ComponentType } from 'react'
import { BookOpen, Code2, FileText, GitBranch, PlayCircle, SquareTerminal } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import { PATH_FOR_PAGE } from '../routes'
import LearningPathStudioPage from '../components/stitch/LearningPathStudioPage'
import type { LearningPathModuleMeta } from '../components/stitch/learningPathTypes'
import TypeScriptCheatsheet from './TypeScriptCheatsheet'
import TsDiscriminatedUnionDemo from './TsDiscriminatedUnionDemo'
import VanillaTsPlayground from './VanillaTsPlayground'

const DEMO_BY_ID: Record<string, ComponentType> = {
  cheatsheet: TypeScriptCheatsheet,
  discriminatedUnion: TsDiscriminatedUnionDemo,
  vanillaPlayground: VanillaTsPlayground,
}

const TS_MODULES: LearningPathModuleMeta[] = [
  {
    id: 'cheatsheet',
    difficulty: 'easy',
    status: 'in_progress',
    progress: 35,
    title: 'TypeScript cheatsheet',
    description: 'Narrowing, generics, utility types, and interview talking points in one reference card.',
    Icon: BookOpen,
  },
  {
    id: 'discriminatedUnion',
    difficulty: 'medium',
    status: 'mastered',
    progress: 100,
    title: 'Discriminated unions',
    description: 'Model success/failure and tagged variants so control flow narrows without unsafe casts.',
    Icon: GitBranch,
  },
  {
    id: 'vanillaPlayground',
    difficulty: 'medium',
    status: 'not_started',
    progress: 10,
    title: 'Vanilla TypeScript playground',
    description: 'Edit real .ts in the browser — try Result<T> patterns, constraints, and mapped types.',
    Icon: Code2,
  },
]

export default function TypeScriptHubPage() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio
  const tip = ui.topicStudios.typescript
  const { home: h, nav } = strings

  return (
    <LearningPathStudioPage
      pageTitle={ui.pages.typescriptTitle}
      pageLead={ui.pages.typescriptHubLead}
      modules={TS_MODULES}
      demoById={DEMO_BY_ID}
      examplesScrollId="lp-ts-cheatsheet"
      examplesModuleId="cheatsheet"
      proTipTitle={tip.proTipTitle}
      proTipBody={tip.proTipBody}
      viewExamplesLabel={tip.viewExamples}
      resources={[
        {
          href: 'https://www.typescriptlang.org/docs/',
          external: true,
          title: 'TypeScript handbook',
          sub: 'Official docs',
          Icon: FileText,
        },
        {
          href: 'https://www.typescriptlang.org/play',
          external: true,
          title: 'TS Playground',
          sub: 'Try types live',
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
          <span className="card-desc topic-hub-footer-copy">{h.cards.typescript.body}</span>
          <Link className="home-card-link" href={`${PATH_FOR_PAGE.questions}?q=${encodeURIComponent('TypeScript')}`}>
            {nav.questions} →
          </Link>
        </p>
      }
    />
  )
}
