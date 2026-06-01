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

  const now = new Date()
  if (doc.plan === 'sprint' && doc.sprintExpiresAt && doc.sprintExpiresAt < now) {
    await col.updateOne({ userId }, { $set: { plan: 'free', updatedAt: now } })
    return { plan: 'free' }
  }

  return { plan: doc.plan, sprintExpiresAt: doc.sprintExpiresAt }
}

export async function upsertSubscription(
  data: Omit<UserSubscriptionDoc, 'updatedAt'>,
  unsetFields?: Partial<Record<keyof UserSubscriptionDoc, ''>>
): Promise<void> {
  const col = await getCollection()
  const update: Record<string, unknown> = { $set: { updatedAt: new Date(), ...data } }
  if (unsetFields && Object.keys(unsetFields).length > 0) {
    update.$unset = unsetFields
  }
  await col.updateOne(
    { userId: data.userId },
    update,
    { upsert: true },
  )
}
