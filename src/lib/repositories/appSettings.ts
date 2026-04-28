import { getDb } from '@/lib/mongodb'

const COLLECTION = 'app_settings'
const GLOBAL_DOC_ID = 'global'

type AppSettingsDoc = {
  _id: string
  jsSandboxUseSandpack?: boolean
  mockInterviewUseSandpack?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type AppSettings = {
  jsSandboxUseSandpack: boolean
  mockInterviewUseSandpack: boolean
}

const DEFAULTS: AppSettings = {
  jsSandboxUseSandpack: false,
  mockInterviewUseSandpack: false,
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDb()
  const doc = await db.collection<AppSettingsDoc>(COLLECTION).findOne({ _id: GLOBAL_DOC_ID })

  return {
    jsSandboxUseSandpack:
      typeof doc?.jsSandboxUseSandpack === 'boolean'
        ? doc.jsSandboxUseSandpack
        : DEFAULTS.jsSandboxUseSandpack,
    mockInterviewUseSandpack:
      typeof doc?.mockInterviewUseSandpack === 'boolean'
        ? doc.mockInterviewUseSandpack
        : DEFAULTS.mockInterviewUseSandpack,
  }
}

export async function updateAppSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDb()
  const now = new Date()
  const $set: Record<string, unknown> = { updatedAt: now }

  if (typeof patch.jsSandboxUseSandpack === 'boolean') {
    $set.jsSandboxUseSandpack = patch.jsSandboxUseSandpack
  }

  if (typeof patch.mockInterviewUseSandpack === 'boolean') {
    $set.mockInterviewUseSandpack = patch.mockInterviewUseSandpack
  }

  const keys = Object.keys($set).filter(k => k !== 'updatedAt')
  if (keys.length === 0) {
    return getAppSettings()
  }

  await db.collection<AppSettingsDoc>(COLLECTION).updateOne(
    { _id: GLOBAL_DOC_ID },
    { $set, $setOnInsert: { _id: GLOBAL_DOC_ID, createdAt: now } },
    { upsert: true },
  )

  return getAppSettings()
}
