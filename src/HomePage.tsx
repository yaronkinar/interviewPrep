import { useLocale } from './i18n/LocaleContext'
import { isRtlLocale } from './i18n/locale'
import { PATH_FOR_PAGE } from './routes'
import ScreenHeader from './components/layout/ScreenHeader'
import HomeModuleCard from './components/home/HomeModuleCard'

export default function HomePage() {
  const { locale, strings } = useLocale()
  const { home: h } = strings
  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'
  const modules = [
    { key: 'js' as const, to: PATH_FOR_PAGE.js, title: h.cards.js.title, body: h.cards.js.body, cta: strings.nav.js },
    { key: 'react' as const, to: PATH_FOR_PAGE.react, title: h.cards.react.title, body: h.cards.react.body, cta: strings.nav.react },
    { key: 'sandbox' as const, to: PATH_FOR_PAGE.sandbox, title: h.cards.sandbox.title, body: h.cards.sandbox.body, cta: strings.nav.sandbox },
    { key: 'mock' as const, to: PATH_FOR_PAGE.mock, title: h.cards.mock.title, body: h.cards.mock.body, cta: strings.nav.mock },
    { key: 'questions' as const, to: PATH_FOR_PAGE.questions, title: h.cards.questions.title, body: h.cards.questions.body, cta: strings.nav.questions },
  ]

  return (
    <div className="home-page editorial-page" dir={contentDir}>
      <div className="home-hero">
        <ScreenHeader title={h.heroTitle} lead={h.heroLead} kicker={h.heroKicker} align="start" />
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
              <HomeModuleCard title={m.title} body={m.body} cta={m.cta} to={m.to} />
            </li>
          ))}
        </ul>
      </section>

      <p className="home-cta">{h.cta}</p>
    </div>
  )
}
