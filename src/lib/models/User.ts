export interface User {
  userId: string
  email: string | null
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}
