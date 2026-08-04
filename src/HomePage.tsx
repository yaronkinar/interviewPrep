'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useLocale } from './i18n/LocaleContext'
import { HOME_DASHBOARD_STRINGS as dash } from './i18n/homeDashboardStrings'
import { isRtlLocale } from './i18n/locale'
import { PATH_FOR_PAGE } from './routes'
import HomeModuleCard from './components/home/HomeModuleCard'
import { useProgress } from './hooks/useProgress'
import { HOME_PROGRESS_TRACKS, type HomeProgressTrack } from './lib/progress/pathToProgressSection'
import { buildHomeModuleProgressLine } from './lib/progress/buildHomeModuleProgressLine'
import { pickFeaturedHomeModules } from './lib/progress/pickFeaturedHomeModules'
import { streakDaysFromProgress } from './lib/progress/streakDaysFromProgress'
import type { UserProgress } from './lib/models/UserProgress'
import { countActiveHomeSections, qaBookmarkProgressCount } from './lib/progress/homeProgressSummary'

/** Card header art in `public/` — locales share visuals. */
const HOME_MODULE_ART: Record<HomeProgressTrack, string> = {
  js: '/home-section-js.webp',
  react: '/home-section-react.webp',
  typescript: '/home-section-react.webp',
  vue: '/home-section-sandbox.webp',
  angular: '/home-section-sandbox.webp',
  sandbox: '/home-section-sandbox.webp',
  mock: '/home-section-mock.webp',
  questions: '/home-section-questions.webp',
  cv: '/home-section-cv.webp',
}

function dayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

function lessonProgress(row: UserProgress | undefined): { pct: number; done: number; total: number } {
  const done = row?.completedQuestionIds?.length ?? 0
  const total = 16
  const raw = Math.min(100, Math.round((done / total) * 100))
  const pct = done === 0 ? 0 : Math.max(raw, 6)
  return { pct, done, total }
}

export default function HomePage() {
  const { locale, strings } = useLocale()
  const { user } = useUser()
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { allProgress, loading: progressLoading } = useProgress()
  const { home: h } = strings

  const bySection = useMemo(() => {
    const allowed = new Set<string>(HOME_PROGRESS_TRACKS)
    const m = new Map<string, UserProgress>()
    for (const p of allProgress) {
      if (p?.section && allowed.has(p.section)) {
        m.set(p.section, p as UserProgress)
      }
    }
    return m
  }, [allProgress])

  const progressSummaryLine = useMemo(() => {
    const active = countActiveHomeSections(bySection)
    const bookmarks = qaBookmarkProgressCount(bySection)
    const total = HOME_PROGRESS_TRACKS.length
    return h.progressSummaryCounts
      .replace('{active}', String(active))
      .replace('{total}', String(total))
      .replace('{bookmarks}', String(bookmarks))
  }, [bySection, h.progressSummaryCounts])

  const streak = useMemo(() => streakDaysFromProgress(bySection), [bySection])
  const [featuredKey, sideAKey, sideBKey] = useMemo(
    () => pickFeaturedHomeModules(bySection),
    [bySection],
  )

  const modules: {
    key: HomeProgressTrack
    section: HomeProgressTrack
    to: string
    title: string
    body: string
    cta: string
  }[] = [
    {
      key: 'js',
      section: 'js',
      to: PATH_FOR_PAGE.js,
      title: h.cards.js.title,
      body: h.cards.js.body,
      cta: strings.nav.js,
    },
    {
      key: 'react',
      section: 'react',
      to: PATH_FOR_PAGE.react,
      title: h.cards.react.title,
      body: h.cards.react.body,
      cta: strings.nav.react,
    },
    {
      key: 'typescript',
      section: 'typescript',
      to: PATH_FOR_PAGE.typescript,
      title: h.cards.typescript.title,
      body: h.cards.typescript.body,
      cta: strings.nav.typescript,
    },
    {
      key: 'vue',
      section: 'vue',
      to: PATH_FOR_PAGE.vue,
      title: h.cards.vue.title,
      body: h.cards.vue.body,
      cta: strings.nav.vue,
    },
    {
      key: 'angular',
      section: 'angular',
      to: PATH_FOR_PAGE.angular,
      title: h.cards.angular.title,
      body: h.cards.angular.body,
      cta: strings.nav.angular,
    },
    {
      key: 'sandbox',
      section: 'sandbox',
      to: PATH_FOR_PAGE.sandbox,
      title: h.cards.sandbox.title,
      body: h.cards.sandbox.body,
      cta: strings.nav.sandbox,
    },
    {
      key: 'mock',
      section: 'mock',
      to: PATH_FOR_PAGE.mock,
      title: h.cards.mock.title,
      body: h.cards.mock.body,
      cta: strings.nav.mock,
    },
    {
      key: 'questions',
      section: 'questions',
      to: PATH_FOR_PAGE.questions,
      title: h.cards.questions.title,
      body: h.cards.questions.body,
      cta: strings.nav.questions,
    },
    {
      key: 'cv',
      section: 'cv',
      to: PATH_FOR_PAGE.cv,
      title: h.cards.cv.title,
      body: h.cards.cv.body,
      cta: strings.nav.cv,
    },
  ]

  const featuredModule = modules.find((m) => m.section === featuredKey) ?? modules[0]
  const sideA = modules.find((m) => m.section === sideAKey) ?? modules[1]
  const sideB = modules.find((m) => m.section === sideBKey) ?? modules[2]

  const challengeIdx = dayOfYear() % modules.length
  const challenge = modules[challengeIdx] ?? modules[0]

  const featuredProg = lessonProgress(bySection.get(featuredModule.section))
  const sideAProg = lessonProgress(bySection.get(sideA.section))
  const sideBProg = lessonProgress(bySection.get(sideB.section))

  const greeting =
    isSignedIn && user?.firstName?.trim()
      ? `${dash.greetingSignedInPrefix}, ${user.firstName.trim()}`
      : dash.greetingSignedOut

  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'

  return (
    <div className="home-page editorial-page stitch-dashboard-page" dir={contentDir}>
      <div className="stitch-dashboard-inner">
        <section className="stitch-dashboard-row" aria-label={h.heroTitle}>
          <div className="stitch-dashboard-greet">
            <h1 className="stitch-dashboard-title">{greeting}</h1>
            <div className="stitch-dashboard-sub">
              {authLoaded && isSignedIn && streak > 0 ? (
                <>
                  <Flame className="stitch-dashboard-streak-icon" size={22} strokeWidth={2} aria-hidden />
                  <span className="stitch-dashboard-streak">{dash.streakDays.replace('{days}', String(streak))}</span>
                  <span className="stitch-dashboard-sub-muted">{dash.streakHint}</span>
                </>
              ) : (
                <p className="stitch-dashboard-lead">{h.heroLead}</p>
              )}
            </div>
          </div>

          <div className="stitch-daily-card">
            <div className="stitch-daily-icon" aria-hidden>
              <span className="stitch-daily-icon-inner">⟳</span>
            </div>
            <div className="stitch-daily-body">
              <p className="stitch-daily-label">{dash.dailyChallengeLabel}</p>
              <h2 className="stitch-daily-topic">{challenge.title}</h2>
              <Link href={challenge.to} className="stitch-daily-cta">
                {dash.dailyChallengeStart}
                <span aria-hidden> →</span>
              </Link>
            </div>
          </div>
        </section>

        {authLoaded && isSignedIn ? (
          <div className="stitch-dashboard-progress-strip">
            {progressLoading ? (
              <p className="home-progress-loading">{h.progressLoading}</p>
            ) : (
              <>
                <h2 className="home-progress-summary-heading">{h.progressSummaryHeading}</h2>
                <p className="home-progress-summary-counts" aria-live="polite">
                  {progressSummaryLine}
                </p>
                <p className="home-progress-invite">{h.progressInvite}</p>
              </>
            )}
          </div>
        ) : null}

        <section className="stitch-bento" aria-labelledby="focus-heading">
          <h2 id="focus-heading" className="visually-hidden">
            {dash.bentoLargeEyebrow}
          </h2>
          <div className="stitch-bento-grid">
            <article className="stitch-bento-large stitch-surface-card">
              <div className="stitch-bento-large-media">
                <Image
                  src={HOME_MODULE_ART[featuredModule.section]}
                  alt=""
                  fill
                  className="stitch-bento-large-img"
                  sizes="(max-width: 1023px) 100vw, 38vw"
                />
              </div>
              <div className="stitch-bento-large-body">
                <div className="stitch-bento-large-meta">
                  <span className="stitch-chip">{dash.moduleChip}</span>
                </div>
                <h3 className="stitch-bento-large-heading">{featuredModule.title}</h3>
                <p className="stitch-bento-large-desc">{featuredModule.body}</p>
                <div className="stitch-progress-row">
                  <span>{dash.progressPercent.replace('{pct}', String(featuredProg.pct))}</span>
                  <span className="stitch-progress-count">
                    {dash.lessonsDone.replace('{done}', String(featuredProg.done)).replace('{total}', String(featuredProg.total))}
                  </span>
                </div>
                <div className="stitch-progress-track stitch-progress-track--inset" aria-hidden>
                  <div className="stitch-progress-fill" style={{ width: `${featuredProg.pct}%` }} />
                </div>
                <Link href={featuredModule.to} className="stitch-btn-primary stitch-bento-primary-btn">
                  {dash.continueJourney}
                </Link>
              </div>
            </article>

            <div className="stitch-bento-stack">
              {[sideA, sideB].map((mod) => {
                const prog = mod.section === sideA.section ? sideAProg : sideBProg
                return (
                  <article key={mod.section} className="stitch-bento-small stitch-surface-card">
                    <h3 className="stitch-bento-small-title">{mod.title}</h3>
                    <div className="stitch-progress-track stitch-progress-track--thin stitch-progress-track--inset">
                      <div className="stitch-progress-fill stitch-progress-fill--mint" style={{ width: `${prog.pct}%` }} />
                    </div>
                    <div className="stitch-bento-small-meta">
                      <span>{dash.progressPercent.replace('{pct}', String(prog.pct))}</span>
                    </div>
                    <p className="stitch-bento-small-desc">{mod.body}</p>
                    <Link href={mod.to} className="stitch-bento-small-link">
                      {dash.secondaryCardLink}
                      <span aria-hidden> →</span>
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="stitch-mentor-band" aria-labelledby="mentor-teaser-heading">
          <div className="stitch-mentor-inner">
            <span id="mentor-teaser-heading" className="stitch-mentor-badge">
              {dash.mentorBadge}
            </span>
            <h2 className="stitch-mentor-title">{dash.mentorTitle}</h2>
            <p className="stitch-mentor-lead">{dash.mentorLead}</p>
            <div className="stitch-mentor-actions">
              <Link href={PATH_FOR_PAGE.mock} className="stitch-btn-primary stitch-btn-primary--on-dark">
                {dash.mentorPrimaryCta}
              </Link>
              <Link href={PATH_FOR_PAGE.questions} className="stitch-btn-outline-light">
                {dash.mentorSecondaryCta}
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section editorial-panel stitch-dashboard-about" aria-labelledby="about-heading">
          <h2 id="about-heading" className="home-section-title">
            {h.sectionAbout}
          </h2>
          <p className="home-section-body">{h.aboutBody}</p>
        </section>

        <section className="home-section editorial-panel" aria-labelledby="how-heading">
          <h2 id="how-heading" className="home-section-title">
            {h.sectionHow}
          </h2>
          <ul className="home-card-grid">
            {modules.map((m) => (
              <li key={m.key}>
                <HomeModuleCard
                  title={m.title}
                  body={m.body}
                  cta={m.cta}
                  to={m.to}
                  illustrationSrc={HOME_MODULE_ART[m.section]}
                  progressLine={
                    authLoaded && isSignedIn && !progressLoading
                      ? buildHomeModuleProgressLine(h, locale, bySection.get(m.section))
                      : null
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        <p className="home-cta">{h.cta}</p>
      </div>
    </div>
  )
}
