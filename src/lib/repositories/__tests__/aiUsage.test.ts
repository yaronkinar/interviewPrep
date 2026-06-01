import {
  checkAndIncrementMockInterview,
  checkAndIncrementCvAnalysis,
  getAiUsage,
} from '../aiUsage'
import { getDb } from '@/lib/mongodb'

jest.mock('@/lib/mongodb')

const mockFindOne = jest.fn()
const mockFindOneAndUpdate = jest.fn()
const mockCreateIndex = jest.fn().mockResolvedValue('idx')

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(getDb).mockResolvedValue({
    collection: () => ({
      findOne: mockFindOne,
      findOneAndUpdate: mockFindOneAndUpdate,
      createIndex: mockCreateIndex,
    }),
  } as any)
})

afterEach(() => {
  jest.resetModules()
})

describe('checkAndIncrementMockInterview', () => {
  it('allows and increments when user is under the limit', async () => {
    // findOneAndUpdate returns the updated doc (after increment)
    mockFindOneAndUpdate.mockResolvedValue({ mockInterviewCount: 2, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(2)
    expect(mockFindOneAndUpdate).toHaveBeenCalled()
  })

  it('blocks when user is at the limit', async () => {
    // findOneAndUpdate returns null when the filter ($lt limit) didn't match
    mockFindOneAndUpdate.mockResolvedValue(null)
    mockFindOne.mockResolvedValue({ mockInterviewCount: 3, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(false)
    expect(result.used).toBe(3)
  })

  it('allows first ever use (no record)', async () => {
    // upsert creates doc with mockInterviewCount: 1
    mockFindOneAndUpdate.mockResolvedValue({ mockInterviewCount: 1, cvAnalysisCount: 0 })
    const result = await checkAndIncrementMockInterview('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(1)
  })

  it('always allows sprint and pro users without touching DB', async () => {
    const sprint = await checkAndIncrementMockInterview('user_abc', 'sprint')
    const pro = await checkAndIncrementMockInterview('user_abc', 'pro')
    expect(sprint.allowed).toBe(true)
    expect(pro.allowed).toBe(true)
    expect(mockFindOneAndUpdate).not.toHaveBeenCalled()
    expect(mockFindOne).not.toHaveBeenCalled()
  })
})

describe('checkAndIncrementCvAnalysis', () => {
  it('blocks when user is at the CV limit', async () => {
    // findOneAndUpdate returns null when the filter ($lt limit) didn't match
    mockFindOneAndUpdate.mockResolvedValue(null)
    mockFindOne.mockResolvedValue({ mockInterviewCount: 0, cvAnalysisCount: 1 })
    const result = await checkAndIncrementCvAnalysis('user_abc', 'free')
    expect(result.allowed).toBe(false)
  })

  it('allows and increments when under the CV limit', async () => {
    // findOneAndUpdate returns the updated doc (after increment)
    mockFindOneAndUpdate.mockResolvedValue({ mockInterviewCount: 0, cvAnalysisCount: 1 })
    const result = await checkAndIncrementCvAnalysis('user_abc', 'free')
    expect(result.allowed).toBe(true)
    expect(result.used).toBe(1)
  })
})
