'use client'

import Link from 'next/link'
import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Circle,
  Loader2,
  Star,
} from 'lucide-react'
import { useLocale } from '../../i18n/LocaleContext'
import { getUiStrings, type UiStrings } from '../../i18n/uiStrings'
import ExpandableCard from '../ExpandableCard'
import MasteryRingCard from './MasteryRingCard'
import type {
  LearningPathDifficulty,
  LearningPathModuleMeta,
  LearningPathResourceDef,
  LearningPathStatus,
} from './learningPathTypes'

export type LearningPathStudioPageProps = {
  breadcrumbHref?: string
  pageTitle: string
  pageLead: string
  modules: LearningPathModuleMeta[]
  demoById: Record<string, ComponentType>
  /** Element id to scroll to for the primary CTA */
  examplesScrollId: string
  /** Module id that receives `examplesScrollId` as its anchor */
  examplesModuleId: string
  proTipTitle: string
  proTipBody: string
  viewExamplesLabel: string
  resources: LearningPathResourceDef[]
  /** Optional watermark behind the pro tip card */
  proTipWatermarkIcon?: LucideIcon
  footerSlot?: ReactNode
  /** Rendered above the mastery ring in the header column (e.g. JS hub actions) */
  headerAside?: ReactNode
}

function difficultyLabel(ui: UiStrings['learningPathStudio'], d: LearningPathDifficulty): string {
  if (d === 'easy') return ui.difficultyEasy
  if (d === 'medium') return ui.difficultyMedium
  return ui.difficultyHard
}

function statusMeta(
  ui: UiStrings['learningPathStudio'],
  status: LearningPathStatus,
): { label: string; Icon: LucideIcon; className: string } {
  switch (status) {
    case 'mastered':
      return { label: ui.statusMastered, Icon: Star, className: 'react-pattern-status--mastered' }
    case 'in_progress':
      return { label: ui.statusInProgress, Icon: Loader2, className: 'react-pattern-status--progress' }
    default:
      return { label: ui.statusNotStarted, Icon: Circle, className: 'react-pattern-status--todo' }
  }
}

export default function LearningPathStudioPage({
  breadcrumbHref = '/',
  pageTitle,
  pageLead,
  modules,
  demoById,
  examplesScrollId,
  examplesModuleId,
  proTipTitle,
  proTipBody,
  viewExamplesLabel,
  resources,
  proTipWatermarkIcon: WatermarkIcon = BookOpen,
  footerSlot,
  headerAside,
}: LearningPathStudioPageProps) {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const lp = ui.learningPathStudio

  const total = modules.length
  const mastered = modules.filter((m) => m.status === 'mastered').length
  const avgPct =
    total === 0 ? 0 : Math.round(modules.reduce((s, m) => s + m.progress, 0) / total)
  const masterySub = lp.masterySubTemplate
    .replace('{mastered}', String(mastered))
    .replace('{total}', String(total))

  const scrollToExamples = () => {
    document.getElementById(examplesScrollId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="editorial-page react-patterns-studio">
      <div className="react-patterns-studio-inner">
        <nav className="react-patterns-breadcrumb" aria-label={lp.breadcrumbSepAria}>
          <Link href={breadcrumbHref}>{lp.breadcrumbLibrary}</Link>
          <ChevronRight className="react-patterns-breadcrumb-chev" aria-hidden size={16} strokeWidth={2} />
          <span className="react-patterns-breadcrumb-current">{pageTitle}</span>
        </nav>

        <header className="react-patterns-studio-header">
          <div className="react-patterns-studio-header-main">
            <h1 className="react-patterns-studio-title">{pageTitle}</h1>
            <p className="react-patterns-studio-lead">{pageLead}</p>
          </div>
          <div className="react-patterns-studio-header-aside">
            {headerAside}
            <MasteryRingCard pct={avgPct} title={lp.masteryTitle} subtitle={masterySub} />
          </div>
        </header>

        <div className="react-patterns-studio-grid">
          <div className="react-patterns-studio-main">
            <h2 className="react-patterns-studio-section-title">{lp.coreConcepts}</h2>
            <div className="react-patterns-studio-list" id="learning-path-modules">
              {modules.map((m) => {
                const Demo = demoById[m.id]
                if (!Demo) return null
                const { label: stLabel, Icon: StIcon, className: stClass } = statusMeta(lp, m.status)
                const anchorId = m.id === examplesModuleId ? examplesScrollId : `lp-mod-${m.id}`
                return (
                  <article
                    key={m.id}
                    id={anchorId}
                    className="react-pattern-studio-card"
                    aria-labelledby={`lp-title-${m.id}`}
                  >
                    <div className="react-pattern-studio-card-head">
                      <div className="react-pattern-studio-card-copy">
                        <div className="react-pattern-studio-meta-row">
                          <span className={`react-pattern-chip react-pattern-chip--${m.difficulty}`}>
                            {difficultyLabel(lp, m.difficulty)}
                          </span>
                          <span className={`react-pattern-status ${stClass}`}>
                            <StIcon
                              size={16}
                              strokeWidth={2}
                              className={
                                m.status === 'mastered'
                                  ? 'react-pattern-status-icon react-pattern-status-icon--filled'
                                  : m.status === 'in_progress'
                                    ? 'react-pattern-status-icon react-pattern-status-icon--spin'
                                    : 'react-pattern-status-icon'
                              }
                              aria-hidden
                            />
                            {stLabel}
                          </span>
                        </div>
                        <h3 className="react-pattern-studio-card-title" id={`lp-title-${m.id}`}>
                          {m.title}
                        </h3>
                        <p className="react-pattern-studio-card-desc">{m.description}</p>
                        <div
                          className="react-pattern-studio-track progress-groove"
                          role="presentation"
                          aria-hidden
                        >
                          <div
                            className="react-pattern-studio-fill"
                            style={{ width: `${Math.min(100, Math.max(0, m.progress))}%` }}
                          />
                        </div>
                      </div>
                      <div className="react-pattern-studio-thumb" aria-hidden>
                        <m.Icon className="react-pattern-studio-thumb-icon" strokeWidth={2} size={28} />
                      </div>
                    </div>
                    <ExpandableCard>
                      <Demo />
                    </ExpandableCard>
                  </article>
                )
              })}
            </div>
          </div>

          <aside className="react-patterns-studio-aside" aria-label={lp.resourcesTitle}>
            <div className="react-patterns-pro-tip">
              <div className="react-patterns-pro-tip-copy">
                <h4 className="react-patterns-pro-tip-title">{proTipTitle}</h4>
                <p className="react-patterns-pro-tip-body">{proTipBody}</p>
                <button type="button" className="react-patterns-pro-tip-btn" onClick={scrollToExamples}>
                  {viewExamplesLabel}
                </button>
              </div>
              <WatermarkIcon
                className="react-patterns-pro-tip-watermark"
                aria-hidden
                strokeWidth={1}
                size={120}
              />
            </div>

            <div className="react-patterns-resources-card">
              <h4 className="react-patterns-resources-heading">
                <BookOpen className="react-patterns-resources-heading-icon" strokeWidth={2} size={20} aria-hidden />
                {lp.resourcesTitle}
              </h4>
              <ul className="react-patterns-resources-list">
                {resources.map((r) => (
                  <li key={`${r.href}-${r.title}`}>
                    {r.external ? (
                      <a
                        className="react-patterns-resource-row"
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="react-patterns-resource-icon-wrap">
                          <r.Icon className="react-patterns-resource-lucide" strokeWidth={2} size={20} aria-hidden />
                        </span>
                        <span className="react-patterns-resource-text">
                          <span className="react-patterns-resource-title">{r.title}</span>
                          <span className="react-patterns-resource-sub">{r.sub}</span>
                        </span>
                        <ArrowUpRight className="react-patterns-resource-arrow" strokeWidth={2} size={18} aria-hidden />
                      </a>
                    ) : (
                      <Link className="react-patterns-resource-row" href={r.href}>
                        <span className="react-patterns-resource-icon-wrap">
                          <r.Icon className="react-patterns-resource-lucide" strokeWidth={2} size={20} aria-hidden />
                        </span>
                        <span className="react-patterns-resource-text">
                          <span className="react-patterns-resource-title">{r.title}</span>
                          <span className="react-patterns-resource-sub">{r.sub}</span>
                        </span>
                        <ChevronRight className="react-patterns-resource-arrow" strokeWidth={2} size={18} aria-hidden />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {footerSlot}
      </div>
    </div>
  )
}
