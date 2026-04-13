import type { Page } from './page'

/** URL path for each app section (home is `/`). */
export const PATH_FOR_PAGE: Record<Page, string> = {
  home: '/',
  js: '/js',
  react: '/react',
  sandbox: '/sandbox',
  mock: '/mock',
  questions: '/questions',
  cv: '/cv',
}

const PATH_TO_PAGE: Record<string, Page> = {
  '/': 'home',
  '/js': 'js',
  '/react': 'react',
  '/sandbox': 'sandbox',
  '/mock': 'mock',
  '/questions': 'questions',
  '/cv': 'cv',
}

/** Map current pathname to a `Page` (trailing slash normalized). Unknown paths → `null`. */
export function pageFromPathname(pathname: string): Page | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  return PATH_TO_PAGE[normalized] ?? null
}
