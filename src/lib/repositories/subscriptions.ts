import { getDb } from '@/lib/mongodb'
import type { UserSubscriptionDoc, Plan } from '@/lib/models/UserSubscription'

const COLLECTION = 'userSubscriptions'
let indexReady: Promise<string> | null = null

async function getCollection() {
  const db = await getDb()
  const col = db.collection<UserSubscriptionDoc>(COLLECTION)
  if (!indexReady) {
    indexReady = col.createIndex({ userId: 1 }, { unique: true })
  }
  await indexReady
  return col
}

export async function getUserPlan(
  userId: string,
): Promise<{ plan: Plan; sprintExpiresAt?: Date }> {
  const col = await getCollection()
  const doc = await col.findOne({ userId })
  if (!doc) return { plan: 'free' }

  if (doc.plan === 'sprint' && doc.sprintExpiresAt && doc.sprintExpiresAt < new Date()) {
    await col.updateOne({ userId }, { $set: { plan: 'free', updatedAt: new Date() } })
    return { plan: 'free' }
  }

  return { plan: doc.plan, sprintExpiresAt: doc.sprintExpiresAt }
}

export async function upsertSubscription(
  data: Omit<UserSubscriptionDoc, 'updatedAt'>,
): Promise<void> {
  const col = await getCollection()
  await col.updateOne(
    { userId: data.userId },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true },
  )
}
