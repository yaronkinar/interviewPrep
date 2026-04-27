import type { Question } from '@/questions/data'

export interface QuestionDocument extends Omit<Question, 'createdAt' | 'updatedAt'> {
  order: number
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export type QuestionInput = Omit<Question, 'createdAt' | 'updatedAt'> & {
  order?: number
}
