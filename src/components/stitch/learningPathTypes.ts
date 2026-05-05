import type { LucideIcon } from 'lucide-react'

export type LearningPathDifficulty = 'easy' | 'medium' | 'hard'

export type LearningPathStatus = 'mastered' | 'in_progress' | 'not_started'

export type LearningPathModuleMeta = {
  id: string
  difficulty: LearningPathDifficulty
  status: LearningPathStatus
  /** 0–100 decorative progress for the groove bar */
  progress: number
  title: string
  description: string
  Icon: LucideIcon
}

export type LearningPathResourceDef = {
  href: string
  external?: boolean
  title: string
  sub: string
  Icon: LucideIcon
}
