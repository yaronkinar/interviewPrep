'use client'

import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Bookmark,
  Boxes,
  Code2,
  FileCode2,
  FileUser,
  Hexagon,
  LayoutDashboard,
  MessageSquareQuote,
  Mic,
  Moon,
  Palette,
  Route,
  Shield,
  Sun,
  SwatchBook,
  Terminal,
  Triangle,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
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

const PUBLIC_TAB_IDS: Page[] = [
  'home',
  'js',
  'react',
  'typescript',
  'vue',
  'angular',
  'css',
  'quest',
  'sandbox',
  'mock',
  'questions',
  'cv',
  'cvThemes',
]

/** Header shortcuts between logo and toolbar (tablet only — desktop uses the sidebar). */
const HEADER_SHORTCUT_PAGES: Page[] = ['home', 'js', 'questions', 'mock']

const PAGE_ICONS: Record<Page, LucideIcon> = {
  home: LayoutDashboard,
  js: Code2,
  react: Boxes,
  typescript: FileCode2,
  vue: Triangle,
  angular: Hexagon,
  css: Palette,
  quest: Route,
  sandbox: Terminal,
  mock: Mic,
  questions: MessageSquareQuote,
  cv: FileUser,
  cvThemes: SwatchBook,
}

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

function linkIsActive(pathname: string, id: Page, to: string): boolean {
  return to === '/'
    ? pathname === '/'
    : id === 'cv'
      ? pathname === '/cv'
      : pathname === to || pathname.startsWith(`${to}/`)
}

type NavLinksProps = {
  className?: string
  linkClassName: (args: { isActive: boolean }) => string
  onNavigate?: () => void
  isAdmin: boolean
  variant?: 'tabs' | 'sidebar'
}

function NavLinks({ className, linkClassName, onNavigate, isAdmin, variant = 'tabs' }: NavLinksProps) {
  const { strings } = useLocale()
  const pathname = usePathname()
  const showIcons = variant === 'sidebar'

  return (
    <div className={className}>
      {PUBLIC_TAB_IDS.map(id => {
        const to = PATH_FOR_PAGE[id]
        const isActive = linkIsActive(pathname, id, to)
        const Icon = PAGE_ICONS[id]
        return (
          <Link key={id} href={to} className={linkClassName({ isActive })} onClick={onNavigate}>
            {showIcons ? <Icon className="stitch-sidebar-icon" size={20} strokeWidth={2} aria-hidden /> : null}
            <span className={showIcons ? 'stitch-sidebar-link-text' : undefined}>{strings.nav[id]}</span>
          </Link>
        )
      })}
      <Link
        href="/saved"
        className={linkClassName({ isActive: pathname === '/saved' })}
        onClick={onNavigate}
      >
        {showIcons ? <Bookmark className="stitch-sidebar-icon" size={20} strokeWidth={2} aria-hidden /> : null}
        <span className={showIcons ? 'stitch-sidebar-link-text' : undefined}>{strings.navSaved}</span>
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className={linkClassName({
            isActive: pathname === '/admin' || pathname.startsWith('/admin/'),
          })}
          onClick={onNavigate}
        >
          {showIcons ? <Shield className="stitch-sidebar-icon" size={20} strokeWidth={2} aria-hidden /> : null}
          <span className={showIcons ? 'stitch-sidebar-link-text' : undefined}>Admin</span>
        </Link>
      )}
    </div>
  )
}

export default function Nav() {
  const { locale, setLocale, strings } = useLocale()
  const ui = getUiStrings(locale)
  const uiQuestions = ui.questions
  const { theme, setTheme } = useTheme()
  const { isSignedIn } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const rtl = isRtlLocale(locale)
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isSignedIn) {
      setIsAdmin(false)
      return
    }

    let canceled = false

    async function loadAdminStatus() {
      try {
        const response = await fetch('/api/admin/me')
        if (!response.ok) {
          if (!canceled) setIsAdmin(false)
          return
        }
        const data = (await response.json()) as { isAdmin?: boolean }
        if (!canceled) setIsAdmin(Boolean(data.isAdmin))
      } catch {
        if (!canceled) setIsAdmin(false)
      }
    }

    loadAdminStatus()
    return () => {
      canceled = true
    }
  }, [isSignedIn])

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <header
        className={`stitch-header${rtl ? ' stitch-header--rtl' : ''}`}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        <div className="stitch-header-inner">
        <div className="stitch-header-left">
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
          <Link href="/" className="nav-logo nav-logo-btn" dir="ltr" translate="no">
            Interview Prep
          </Link>
        </div>
          <nav className="stitch-header-shortcuts">
            {HEADER_SHORTCUT_PAGES.map(pageId => {
              const to = PATH_FOR_PAGE[pageId]
              const isActive = linkIsActive(pathname, pageId, to)
              return (
                <Link
                  key={pageId}
                  href={to}
                  className={`stitch-header-shortcut${isActive ? ' stitch-header-shortcut--active' : ''}`}
                >
                  {strings.nav[pageId]}
                </Link>
              )
            })}
          </nav>
          <div className="nav-toolbar">
            <div className="nav-theme" role="group" aria-label={ui.theme.label}>
              <button
                type="button"
                className="nav-theme-btn"
                aria-pressed={theme === 'light'}
                aria-label={ui.theme.useLight}
                title={ui.theme.useLight}
                onClick={() => setTheme('light')}
                suppressHydrationWarning
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
                suppressHydrationWarning
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
            <div className="nav-auth">
              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button type="button" className="nav-signin-btn">
                    Sign in
                  </button>
                </SignInButton>
              )}
              {isSignedIn && <UserButton />}
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`stitch-sidebar${rtl ? ' stitch-sidebar--rtl' : ''}`}
        aria-label={uiQuestions.learningPathsTitle}
      >
        <div className="stitch-sidebar-head">
          <h2 className="stitch-sidebar-title">{uiQuestions.learningPathsTitle}</h2>
        </div>
        <NavLinks
          className="stitch-sidebar-nav"
          linkClassName={({ isActive }) => `stitch-sidebar-link${isActive ? ' stitch-sidebar-link--active' : ''}`}
          isAdmin={isAdmin}
          variant="sidebar"
        />
      </aside>

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
          isAdmin={isAdmin}
        />
        <div className="nav-auth nav-auth--drawer">
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button type="button" className="nav-signin-btn">
                Sign in
              </button>
            </SignInButton>
          )}
          {isSignedIn && <UserButton />}
        </div>
      </SheetContent>
    </Sheet>
  )
}
