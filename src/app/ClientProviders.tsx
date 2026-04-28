'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import AppBrowserConsole from '@/components/AppBrowserConsole'
import Nav from '@/Nav'
import { LocaleProvider, useLocale } from '@/i18n/LocaleContext'
import { ThemeProvider } from '@/theme/ThemeContext'
import { AUTHOR_LINKEDIN_URL } from '@/site'
import GlobalQuestionFinderChat from '@/questions/GlobalQuestionFinderChat'
import TrackProgressVisit from '@/components/TrackProgressVisit'
import { preloadQuestionCatalog } from '@/questions/useQuestionCatalog'
import type { ReactNode } from 'react'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string | undefined

function GaTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return
    if (document.getElementById('ga-gtag-script')) return

    const gtagScript = document.createElement('script')
    gtagScript.id = 'ga-gtag-script'
    gtagScript.async = true
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(gtagScript)

    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  }, [])

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_path: pathname,
      page_location: window.location.href,
    })
  }, [pathname])

  return null
}

function QuestionCatalogPreloader() {
  useEffect(() => {
    const preload = () => {
      preloadQuestionCatalog().catch(() => {
        // Page-level loaders surface errors if the catalog is actually needed.
      })
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }

    const id = globalThis.setTimeout(preload, 0)
    return () => globalThis.clearTimeout(id)
  }, [])

  return null
}

function AppShellInner({ children }: { children: ReactNode }) {
  const { strings } = useLocale()
  return (
    <div className="app-shell">
      <Nav />
      <main className="main">{children}</main>
      <footer className="site-footer">
        <p className="site-footer-inner">
          {strings.siteCreditPrefix}
          <a
            className="site-footer-link"
            href={AUTHOR_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {strings.siteCreditName}
          </a>
        </p>
      </footer>
      <Analytics />
      <AppBrowserConsole />
      <GlobalQuestionFinderChat />
      <GaTracker />
      <QuestionCatalogPreloader />
      <TrackProgressVisit />
    </div>
  )
}

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AppShellInner>{children}</AppShellInner>
      </LocaleProvider>
    </ThemeProvider>
  )
}
