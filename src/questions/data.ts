export type Difficulty = 'easy' | 'medium' | 'hard'
export type Category =
  | 'Closures & Scope'
  | 'Async & Promises'
  | 'Prototypes & OOP'
  | 'DOM & Browser'
  | 'ES6+'
  | 'Algorithms'
  | 'System Design'
  | 'Performance'

export const CATEGORIES: Category[] = [
  'Closures & Scope',
  'Async & Promises',
  'Prototypes & OOP',
  'DOM & Browser',
  'ES6+',
  'Algorithms',
  'System Design',
  'Performance',
]

export interface Question {
  id: string
  companies: string[]
  title: string
  difficulty: Difficulty
  category: Category
  description: string
  answer: string
  answerType: 'code' | 'text' | 'mixed'
  tags: string[]
  source?: string
  /** ISO 8601 timestamps from the server catalog; omitted for custom/local questions */
  createdAt?: string
  updatedAt?: string
}

export const COMPANIES = [
  { id: 'Google',  emoji: '🔵', color: '#4285F4' },
  { id: 'Meta',    emoji: '🔵', color: '#1877F2' },
  { id: 'Amazon',  emoji: '🟠', color: '#FF9900' },
  { id: 'Apple',   emoji: '⚫', color: '#A2AAAD' },
  { id: 'TikTok',  emoji: '⚫', color: '#EE1D52' },
  { id: 'Airbnb',  emoji: '🔴', color: '#FF5A5F' },
  { id: 'Netflix', emoji: '🔴', color: '#E50914' },
  { id: 'Stripe',  emoji: '🟣', color: '#635BFF' },
  { id: 'Uber',    emoji: '⚫', color: '#000000' },
  { id: 'DriveNets', emoji: '🟢', color: '#22C55E' },
  { id: 'CrowdStrike', emoji: '🔴', color: '#EC0000' },
  { id: 'Tenable', emoji: '🟢', color: '#00A86B' },
  { id: 'PlainID', emoji: '🟣', color: '#6D5DF6' },
]
