import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useLocale } from './i18n/LocaleContext'
import { getUiStrings } from './i18n/uiStrings'
import { isRtlLocale, type Locale } from './i18n/locale'
import { SUPPORTED_LOCALES } from './i18n/LocaleContext'
import type { Page } from './page'
import { PATH_FOR_PAGE } from './routes'
import { useTheme } from './theme/ThemeContext'

const TAB_IDS: Page[] = ['home', 'js', 'react', 'css', 'sandbox', 'mock', 'questions', 'cv', 'cvThemes']
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

type NavLinksProps = {
  className?: string
  linkClassName: string | ((args: { isActive: boolean }) => string)
  onNavigate?: () => void
}

function NavLinks({ className, linkClassName, onNavigate }: NavLinksProps) {
  const { strings } = useLocale()
  return (
    <div className={className}>
      {TAB_IDS.map(id => (
        <NavLink
          key={id}
          to={PATH_FOR_PAGE[id]}
          end={id === 'home'}
          className={linkClassName}
          onClick={onNavigate}
        >
          {strings.nav[id]}
        </NavLink>
      ))}
    </div>
  )
}

export default function Nav() {
  const { locale, setLocale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const { theme, setTheme } = useTheme()
  const rtl = isRtlLocale(locale)
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 721px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <div className="nav-shell">
      <nav className={`nav${rtl ? ' nav--rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
        <div className="nav-inner">
          <SheetTrigger asChild>
            <button
              type="button"
              className="nav-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="nav-mobile-drawer"
              aria-label={menuOpen ? ui.nav.closeMenu : ui.nav.openMenu}
            >
              <span className="nav-menu-toggle-bars" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </SheetTrigger>
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
                <Sun size={18} strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="nav-theme-btn"
                aria-pressed={theme === 'dark'}
                aria-label={ui.theme.useDark}
                title={ui.theme.useDark}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="nav-locale">
              <label htmlFor="nav-locale" className="nav-locale-label">
                {strings.home.langLabel}
              </label>
              <select
                id="nav-locale"
                className="nav-locale-select"
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
            <NavLinks
              className="nav-tabs nav-tabs--inline"
              linkClassName={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
            />
          </div>
        </div>
      </nav>
      </div>
      <SheetContent
        id="nav-mobile-drawer"
        side={rtl ? 'right' : 'left'}
        className="nav-mobile-sheet w-[min(20rem,88vw)] p-0"
        showCloseButton={false}
      >
        <SheetHeader className="nav-mobile-drawer-header">
          <SheetTitle className="nav-mobile-drawer-title">{ui.nav.menuLabel}</SheetTitle>
          <SheetClose asChild>
            <button type="button" className="nav-mobile-drawer-close" aria-label={ui.nav.closeMenu}>
              ×
            </button>
          </SheetClose>
        </SheetHeader>
        <NavLinks
          className="nav-tabs nav-tabs--drawer"
          linkClassName={({ isActive }) => `nav-tab nav-tab--drawer${isActive ? ' active' : ''}`}
          onNavigate={closeMenu}
        />
      </SheetContent>
    </Sheet>
  )
}
