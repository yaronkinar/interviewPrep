/**
 * Tracks user progress keyed by coarse “section”. Must match `/api/progress`
 * payloads and rows in Mongo `userProgress`.
 */
export const HOME_PROGRESS_TRACKS = [
  'js',
  'react',
  'sandbox',
  'mock',
  'questions',
  'cv',
] as const

export type HomeProgressTrack = (typeof HOME_PROGRESS_TRACKS)[number]

/** Returns a progress section key for the pathname, or null (e.g. home, unknown). */
export function pathToProgressSection(pathname: string): HomeProgressTrack | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized === '/js') return 'js'
  if (normalized === '/react') return 'react'
  if (normalized === '/sandbox') return 'sandbox'
  if (normalized === '/mock') return 'mock'
  if (normalized === '/questions') return 'questions'
  if (normalized === '/cv' || normalized.startsWith('/cv/')) return 'cv'
  return null
}
