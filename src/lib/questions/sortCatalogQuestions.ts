import type { Question, Difficulty } from '@/questions/data'

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

function parseIsoMs(iso: string | undefined): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : null
}

function cmpTitle(a: Question, b: Question) {
  return a.title.localeCompare(b.title)
}

/** How to order questions in the public catalog (browse + mock interview). */
export type CatalogSortMode =
  | 'curated'
  | 'title-asc'
  | 'title-desc'
  | 'newest'
  | 'recently-updated'
  | 'difficulty-asc'
  | 'category-asc'

export function sortCatalogQuestions(questions: Question[], mode: CatalogSortMode): Question[] {
  if (mode === 'curated') return [...questions]

  const copy = [...questions]

  switch (mode) {
    case 'title-asc':
      return copy.sort(cmpTitle)
    case 'title-desc':
      return copy.sort((a, b) => -cmpTitle(a, b))
    case 'newest':
      return copy.sort((a, b) => {
        const ta = parseIsoMs(a.createdAt)
        const tb = parseIsoMs(b.createdAt)
        if (ta === null && tb === null) return cmpTitle(a, b)
        if (ta === null) return 1
        if (tb === null) return -1
        return tb - ta || cmpTitle(a, b)
      })
    case 'recently-updated':
      return copy.sort((a, b) => {
        const ta = parseIsoMs(a.updatedAt)
        const tb = parseIsoMs(b.updatedAt)
        if (ta === null && tb === null) return cmpTitle(a, b)
        if (ta === null) return 1
        if (tb === null) return -1
        return tb - ta || cmpTitle(a, b)
      })
    case 'difficulty-asc':
      return copy.sort(
        (a, b) =>
          DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] || cmpTitle(a, b),
      )
    case 'category-asc':
      return copy.sort((a, b) => a.category.localeCompare(b.category) || cmpTitle(a, b))
    default:
      return copy
  }
}

export type AdminQuestionSortField = 'order' | 'createdAt' | 'updatedAt' | 'title' | 'category' | 'difficulty'
export type SortDirection = 'asc' | 'desc'

type AdminSortable = {
  order: number
  createdAt: string
  updatedAt: string
  title: string
  category: string
  difficulty: Difficulty
}

export function sortAdminQuestions<T extends AdminSortable>(
  questions: T[],
  field: AdminQuestionSortField,
  direction: SortDirection,
): T[] {
  const copy = [...questions]
  const dir = direction === 'asc' ? 1 : -1

  copy.sort((a, b) => {
    let c = 0
    switch (field) {
      case 'order':
        c = a.order - b.order
        break
      case 'createdAt':
        c = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        c = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'title':
        c = a.title.localeCompare(b.title)
        break
      case 'category':
        c = a.category.localeCompare(b.category)
        break
      case 'difficulty':
        c = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]
        break
      default:
        c = 0
    }
    if (c !== 0) return c * dir
    return a.title.localeCompare(b.title)
  })

  return copy
}
