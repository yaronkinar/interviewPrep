export interface Company {
  id: string
  emoji: string
  color: string
}

export interface CompanyDocument extends Company {
  order: number
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date | null
}

export type CompanyInput = Company & {
  order?: number
}
