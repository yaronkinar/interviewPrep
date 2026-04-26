import type { Question } from '@/questions/data'

export interface QuestionDocument extends Question {
  order: number
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export type QuestionInput = Question & {
  order?: number
}
