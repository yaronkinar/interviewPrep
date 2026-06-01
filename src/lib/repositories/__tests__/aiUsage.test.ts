import {
  checkAndIncrementMockInterview,
  checkAndIncrementCvAnalysis,
  getAiUsage,
} from '../aiUsage'
import { getDb } from '@/lib/mongodb'

jest.mock('@/lib/mongodb')

const mockFindOne = jest.fn()
const mockUpdateOne = jest.fn()
const mockCreateIndex = jest.fn().mockResolvedValue('idx')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getDb).mockResolvedValue({
    collection: () => ({
      findOne: mockFindOne,
      updateOne: mockUpdateOne,
      createIndex: mockCreateIndex,
    }),
  } as any)
})

afterEach(() => {
  jest.resetModules()
})

describe('checkAndIncrementMockInterview', () => {
  it('allows and increments when user is under the limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 1, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(2)
    expect(mockUpdateOne).toHaveBeenCalled()
  })

  it('blocks when user is at the limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 3, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(false)
    expect(mockUpdateOne).not.toHaveBeenCalled()
  })

  it('allows first ever use (no record)', async () => {
    mockFindOne.mockResolvedValue(null)
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(1)
  })

  it('always allows sprint and pro users without touching DB', async () => {
    const sprint = await checkAndIncrementMockInterview('user_abc', 'sprint')
    const pro = await checkAndIncrementMockInterview('user_abc', 'pro')
    expect(sprint.allowed).toBe(true)
    expect(pro.allowed).toBe(true)
    expect(mockFindOne).not.toHaveBeenCalled()
  })
})

describe('checkAndIncrementCvAnalysis', () => {
  it('blocks when user is at the CV limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 0, cvAnalysisCount: 1 })
    const result = await checkAndIncrementCvAnalysis('user_abc', 'free')
    expect(result.allowed).toBe(false)
  })

  it('allows and increments when under the CV limit', async () => {
    mockFindOne.mockResolvedValue({ mockInterviewCount: 0, cvAnalysisCount: 0 })
    const result = await checkAndIncrementCvAnalysis('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(1)
  })
})
