import { getDb } from '@/lib/mongodb'
import type { User } from '@/lib/models/User'

const COLLECTION_NAME = 'users'
let indexReadyPromise: Promise<string> | null = null

async function getUsersCollection() {
  const db = await getDb()
  const collection = db.collection<User>(COLLECTION_NAME)
  if (!indexReadyPromise) {
    indexReadyPromise = collection.createIndex({ userId: 1 }, { unique: true })
  }
  await indexReadyPromise
  return collection
}

export async function getUserByUserId(userId: string) {
  const users = await getUsersCollection()
  return users.findOne({ userId })
}

export async function isUserAdmin(userId: string) {
  const user = await getUserByUserId(userId)
  return Boolean(user?.isAdmin)
}

export async function setUserAdminStatus(args: {
  userId: string
  isAdmin: boolean
  email?: string | null
}) {
  const users = await getUsersCollection()
  const now = new Date()

  await users.updateOne(
    { userId: args.userId },
    {
      $set: {
        isAdmin: args.isAdmin,
        updatedAt: now,
        ...(args.email !== undefined ? { email: args.email } : {}),
      },
      $setOnInsert: {
        userId: args.userId,
        email: args.email ?? null,
        createdAt: now,
      },
    },
    { upsert: true },
  )
}

export async function getAdminFlagsByUserIds(userIds: string[]) {
  if (userIds.length === 0) return {}

  const users = await getUsersCollection()
  const docs = await users
    .find({ userId: { $in: userIds } }, { projection: { _id: 0, userId: 1, isAdmin: 1 } })
    .toArray()

  return docs.reduce<Record<string, boolean>>((acc, doc) => {
    acc[doc.userId] = Boolean(doc.isAdmin)
    return acc
  }, {})
}

export async function countAdmins() {
  const users = await getUsersCollection()
  return users.countDocuments({ isAdmin: true })
}
