import { getUserPlan } from '../subscriptions'
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

describe('getUserPlan', () => {
  it('returns free when no subscription record exists', async () => {
    mockFindOne.mockResolvedValue(null)
    const result = await getUserPlan('user_abc')
    expect(result).toEqual({ plan: 'free' })
  })

  it('returns pro when plan is pro', async () => {
    mockFindOne.mockResolvedValue({ plan: 'pro' })
    const result = await getUserPlan('user_abc')
    expect(result.plan).toBe('pro')
    expect(result.sprintExpiresAt).toBeUndefined()
  })

  it('returns sprint and expiry when sprint is active', async () => {
    const future = new Date(Date.now() + 86_400_000)
    mockFindOne.mockResolvedValue({ plan: 'sprint', sprintExpiresAt: future })
    const result = await getUserPlan('user_abc')
    expect(result.plan).toBe('sprint')
    expect(result.sprintExpiresAt).toEqual(future)
  })

  it('downgrades expired sprint to free and updates DB', async () => {
    const past = new Date(Date.now() - 1000)
    mockFindOne.mockResolvedValue({ plan: 'sprint', sprintExpiresAt: past })
    const result = await getUserPlan('user_abc')
    expect(result).toEqual({ plan: 'free' })
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { userId: 'user_abc' },
      { $set: { plan: 'free', updatedAt: expect.any(Date) } },
    )
  })
})
