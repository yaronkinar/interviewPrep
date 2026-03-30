import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { useLocale } from './i18n/LocaleContext'
import { getUiStrings } from './i18n/uiStrings'
import { isRtlLocale } from './i18n/locale'
import type { Page } from './page'
import { PATH_FOR_PAGE } from './routes'
import { useTheme } from './theme/ThemeContext'

const TAB_IDS: Page[] = ['home', 'js', 'react', 'sandbox', 'mock', 'questions']

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
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const { theme, setTheme } = useTheme()
  const rtl = isRtlLocale(locale)
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerTitleId = useId()

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 721px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const mobileOverlay = (
    <>
      <div
        className={`nav-mobile-backdrop${menuOpen ? ' nav-mobile-backdrop--visible' : ''}`}
        aria-hidden={!menuOpen}
        onClick={closeMenu}
      />
      <aside
        id="nav-mobile-drawer"
        className={`nav-mobile-drawer${rtl ? ' nav-mobile-drawer--rtl' : ''}${menuOpen ? ' nav-mobile-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawerTitleId}
        aria-hidden={!menuOpen}
        onClick={e => e.stopPropagation()}
      >
        <div className="nav-mobile-drawer-header">
          <p id={drawerTitleId} className="nav-mobile-drawer-title">
            {ui.nav.menuLabel}
          </p>
          <button
            type="button"
            className="nav-mobile-drawer-close"
            aria-label={ui.nav.closeMenu}
            onClick={closeMenu}
          >
            ×
          </button>
        </div>
        <NavLinks
          className="nav-tabs nav-tabs--drawer"
          linkClassName={({ isActive }) => `nav-tab nav-tab--drawer${isActive ? ' active' : ''}`}
          onNavigate={closeMenu}
        />
      </aside>
    </>
  )

  return (
    <>
      <nav
        className={`nav${rtl ? ' nav--rtl' : ''}${menuOpen ? ' nav--menu-open' : ''}`}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        <div className="nav-inner">
          <button
            type="button"
            className="nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-drawer"
            aria-label={menuOpen ? ui.nav.closeMenu : ui.nav.openMenu}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className="nav-menu-toggle-bars" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
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
            <NavLinks
              className="nav-tabs nav-tabs--inline"
              linkClassName={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
            />
          </div>
        </div>
      </nav>
      {createPortal(mobileOverlay, document.body)}
    </>
  )
}
