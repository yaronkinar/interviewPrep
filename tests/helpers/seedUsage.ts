import { MongoClient } from 'mongodb'

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

async function connect() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME ?? 'interviews'
  if (!uri) throw new Error('MONGODB_URI is not set in .env')
  const client = new MongoClient(uri)
  await client.connect()
  return { col: client.db(dbName).collection('aiUsage'), client }
}

export async function seedAiUsage(
  userId: string,
  counts: { cvAnalysisCount?: number; mockInterviewCount?: number },
) {
  const { col, client } = await connect()
  try {
    await col.updateOne(
      { userId, month: currentMonth() },
      {
        $set: {
          userId,
          month: currentMonth(),
          cvAnalysisCount: counts.cvAnalysisCount ?? 0,
          mockInterviewCount: counts.mockInterviewCount ?? 0,
        },
      },
      { upsert: true },
    )
  } finally {
    await client.close()
  }
}

export async function clearAiUsage(userId: string) {
  const { col, client } = await connect()
  try {
    await col.deleteOne({ userId, month: currentMonth() })
  } finally {
    await client.close()
  }
}
