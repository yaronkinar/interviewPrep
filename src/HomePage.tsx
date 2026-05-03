import { useMemo } from 'react'
import Image from 'next/image'
import { useAuth } from '@clerk/nextjs'
import { useLocale } from './i18n/LocaleContext'
import { isRtlLocale } from './i18n/locale'
import { PATH_FOR_PAGE } from './routes'
import ScreenHeader from './components/layout/ScreenHeader'
import HomeModuleCard from './components/home/HomeModuleCard'
import { useProgress } from './hooks/useProgress'
import { HOME_PROGRESS_TRACKS, type HomeProgressTrack } from './lib/progress/pathToProgressSection'
import { buildHomeModuleProgressLine } from './lib/progress/buildHomeModuleProgressLine'
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

export default function HomePage() {
  const { locale, strings } = useLocale()
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

  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'

  return (
    <div className="home-page editorial-page" dir={contentDir}>
      <div className="home-hero">
        <div className="home-hero-layout">
          <div className="home-hero-stack">
            <ScreenHeader title={h.heroTitle} lead={h.heroLead} kicker={h.heroKicker} align="start" />

            {authLoaded && isSignedIn ? (
              <div className="home-progress-panel">
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
          </div>

          <figure className="home-hero-art" aria-hidden="true">
            <Image
              src="/og-interview-prep-home.webp"
              alt=""
              width={1200}
              height={630}
              className="home-hero-og-image"
              sizes="(max-width: 899px) min(100vw, 40rem) min(44vw, 480px)"
              priority
            />
          </figure>
        </div>
      </div>

      <section className="home-section editorial-panel" aria-labelledby="about-heading">
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
  )
}
