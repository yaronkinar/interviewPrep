import { Link } from 'react-router-dom'
import { useLocale } from './i18n/LocaleContext'
import { isRtlLocale } from './i18n/locale'
import { PATH_FOR_PAGE } from './routes'

export default function HomePage() {
  const { locale, strings } = useLocale()
  const { home: h } = strings
  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'

  return (
    <div className="home-page" dir={contentDir}>
      <header className="home-hero">
        <h1 className="home-hero-title">{h.heroTitle}</h1>
        <p className="home-hero-lead">{h.heroLead}</p>
      </header>

      <section className="home-section" aria-labelledby="about-heading">
        <h2 id="about-heading" className="home-section-title">
          {h.sectionAbout}
        </h2>
        <p className="home-section-body">{h.aboutBody}</p>
      </section>

      <section className="home-section" aria-labelledby="how-heading">
        <h2 id="how-heading" className="home-section-title">
          {h.sectionHow}
        </h2>
        <ul className="home-card-grid">
          <li>
            <article className="home-card card">
              <h3 className="card-title">{h.cards.js.title}</h3>
              <p className="home-card-body">{h.cards.js.body}</p>
              <Link className="home-card-link" to={PATH_FOR_PAGE.js}>
                {strings.nav.js} →
              </Link>
            </article>
          </li>
          <li>
            <article className="home-card card">
              <h3 className="card-title">{h.cards.react.title}</h3>
              <p className="home-card-body">{h.cards.react.body}</p>
              <Link className="home-card-link" to={PATH_FOR_PAGE.react}>
                {strings.nav.react} →
              </Link>
            </article>
          </li>
          <li>
            <article className="home-card card">
              <h3 className="card-title">{h.cards.sandbox.title}</h3>
              <p className="home-card-body">{h.cards.sandbox.body}</p>
              <Link className="home-card-link" to={PATH_FOR_PAGE.sandbox}>
                {strings.nav.sandbox} →
              </Link>
            </article>
          </li>
          <li>
            <article className="home-card card">
              <h3 className="card-title">{h.cards.mock.title}</h3>
              <p className="home-card-body">{h.cards.mock.body}</p>
              <Link className="home-card-link" to={PATH_FOR_PAGE.mock}>
                {strings.nav.mock} →
              </Link>
            </article>
          </li>
          <li>
            <article className="home-card card">
              <h3 className="card-title">{h.cards.questions.title}</h3>
              <p className="home-card-body">{h.cards.questions.body}</p>
              <Link className="home-card-link" to={PATH_FOR_PAGE.questions}>
                {strings.nav.questions} →
              </Link>
            </article>
          </li>
        </ul>
      </section>

      <p className="home-cta">{h.cta}</p>
    </div>
  )
}
