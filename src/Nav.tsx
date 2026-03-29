import { Link, NavLink } from 'react-router-dom'
import { useLocale } from './i18n/LocaleContext'
import { getUiStrings } from './i18n/uiStrings'
import { isRtlLocale } from './i18n/locale'
import type { Page } from './page'
import { PATH_FOR_PAGE } from './routes'
import { useTheme } from './theme/ThemeContext'

const TAB_IDS: Page[] = ['home', 'js', 'react', 'sandbox', 'mock', 'questions']

export default function Nav() {
  const { locale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const { theme, setTheme } = useTheme()
  const rtl = isRtlLocale(locale)

  return (
    <nav className={`nav${rtl ? ' nav--rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo nav-logo-btn" dir="ltr" translate="no">
          Interview Prep
        </Link>
        <div className="nav-toolbar">
          <div className="nav-theme" role="group" aria-label={ui.theme.label}>
            <button
              type="button"
              className="nav-theme-btn"
              aria-pressed={theme === 'light'}
              aria-label={ui.theme.useLight}
              title={ui.theme.useLight}
              onClick={() => setTheme('light')}
            >
              ☀️
            </button>
            <button
              type="button"
              className="nav-theme-btn"
              aria-pressed={theme === 'dark'}
              aria-label={ui.theme.useDark}
              title={ui.theme.useDark}
              onClick={() => setTheme('dark')}
            >
              🌙
            </button>
          </div>
          <div className="nav-tabs">
            {TAB_IDS.map(id => (
              <NavLink
                key={id}
                to={PATH_FOR_PAGE[id]}
                end={id === 'home'}
                className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
              >
                {strings.nav[id]}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
