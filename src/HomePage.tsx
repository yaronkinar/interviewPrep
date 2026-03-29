import { Link } from 'react-router-dom'
import { useLocale, SUPPORTED_LOCALES } from './i18n/LocaleContext'
import { isRtlLocale, type Locale } from './i18n/locale'
import { PATH_FOR_PAGE } from './routes'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  he: 'עברית',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ar: 'العربية',
  ru: 'Русский',
  hi: 'हिन्दी',
  pl: 'Polski',
  ko: '한국어',
}

export default function HomePage() {
  const { locale, setLocale, strings } = useLocale()
  const { home: h } = strings
  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'

  return (
    <div className="home-page" dir={contentDir}>
      <header className="home-hero">
        <div className="home-lang-row">
          <label htmlFor="home-locale" className="home-lang-label">
            {h.langLabel}
          </label>
          <select
            id="home-locale"
            className="home-locale-select"
            value={locale}
            onChange={e => setLocale(e.target.value as Locale)}
          >
            {SUPPORTED_LOCALES.map(code => (
              <option key={code} value={code}>
                {LOCALE_LABELS[code]}
              </option>
            ))}
          </select>
        </div>
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
