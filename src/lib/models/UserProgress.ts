export interface UserProgress {
  userId: string
  section: string
  completedQuestionIds: string[]
  lastVisitedAt: Date
}
