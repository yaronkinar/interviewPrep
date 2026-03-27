declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

function ensureGtag(): typeof window.gtag | undefined {
  if (!MEASUREMENT_ID) return undefined
  window.dataLayer = window.dataLayer ?? []
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args)
    }
  }
  return window.gtag
}

/**
 * Loads GA4 and configures it once. Safe to call multiple times; script loads only once.
 * When `VITE_GA_MEASUREMENT_ID` is unset, this is a no-op.
 */
export function initAnalytics(): void {
  if (!MEASUREMENT_ID || typeof document === 'undefined') return
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) return

  const gtag = ensureGtag()
  if (!gtag) return

  gtag('js', new Date())
  // SPA: we send page_view from the app when the route/tab changes.
  gtag('config', MEASUREMENT_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

/**
 * Sends a page view for SPA navigations (initial load + in-app tab changes).
 */
export function trackPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID) return
  const gtag = ensureGtag()
  if (!gtag) return

  gtag('config', MEASUREMENT_ID, {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    ...(title != null && title !== '' ? { page_title: title } : {}),
  })
}

/**
 * Custom events (e.g. navigation, interactions).
 */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!MEASUREMENT_ID) return
  const gtag = ensureGtag()
  if (!gtag) return
  gtag('event', name, params ?? {})
}
