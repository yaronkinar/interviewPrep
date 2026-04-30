/** Mirrors server-side search tokenization in `searchQuestions` so URL `?q=` filtering matches finder/API behavior. */

export const CATALOG_SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'for',
  'find',
  'give',
  'i',
  'interview',
  'me',
  'of',
  'on',
  'please',
  'question',
  'questions',
  'show',
  'the',
  'to',
  'with',
])

export function normalizeCatalogSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function tokenizeCatalogSearchQuery(value: string): string[] {
  return normalizeCatalogSearchText(value)
    .split(/\s+/)
    .filter(token => token.length > 1 && !CATALOG_SEARCH_STOP_WORDS.has(token))
}
