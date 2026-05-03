import { getDb } from '@/lib/mongodb'
import type {
  UserApiCredentialsClientSnapshot,
  UserApiCredentialsDoc,
  UserApiCredentialsDto,
} from '@/lib/models/UserApiCredentials'
import {
  decryptUserSecretCiphertext,
  encryptUserSecretPlaintext,
  getCredentialsCryptoContext,
} from '@/lib/userCredentials/crypto'
import { normalizeAnthropicModel } from '@/questions/anthropicConstants'
import { normalizeGeminiModel } from '@/questions/geminiConstants'
import { normalizeLlmProvider, type LlmProvider } from '@/questions/llmConstants'
import { normalizeOpenaiModel } from '@/questions/openaiConstants'

const COLLECTION = 'userApiCredentials'

const MAX_SECRET_LEN = 4096

const SECRET_KEYS = [
  'anthropicApiKey',
  'geminiApiKey',
  'openaiApiKey',
  'elevenLabsApiKey',
  'googleCloudTtsApiKey',
] as const

type SecretBodyField = (typeof SECRET_KEYS)[number]

type CipherPlainKeys =
  | 'anthropicApiKeyCipher'
  | 'geminiApiKeyCipher'
  | 'openaiApiKeyCipher'
  | 'elevenLabsApiKeyCipher'
  | 'googleCloudTtsApiKeyCipher'
  | 'anthropicApiKeyPlain'
  | 'geminiApiKeyPlain'
  | 'openaiApiKeyPlain'
  | 'elevenLabsApiKeyPlain'
  | 'googleCloudTtsApiKeyPlain'

export function sanitizePutBody(raw: Record<string, unknown>): (
  | { ok: false; error: string; status: number }
  | { ok: true; dto: Partial<UserApiCredentialsDto> }
) {
  const dto: Partial<UserApiCredentialsDto> = {}

  if (raw.provider !== undefined) {
    if (typeof raw.provider !== 'string') {
      return { ok: false, error: 'provider must be a string', status: 400 }
    }
    dto.provider = normalizeLlmProvider(raw.provider)
  }

  for (const k of [...SECRET_KEYS, 'anthropicModel', 'geminiModel', 'openaiModel'] as const) {
    const v = raw[k]
    if (v === undefined) continue
    if (v !== null && typeof v !== 'string') {
      return { ok: false, error: `${String(k)} must be a string or null`, status: 400 }
    }
    const str = typeof v === 'string' ? v.trim() : ''
    if (str.length > MAX_SECRET_LEN) {
      return { ok: false, error: `${String(k)} exceeds max length`, status: 400 }
    }
    if ((k as string).endsWith('Model')) {
      dto[k as 'anthropicModel' | 'geminiModel' | 'openaiModel'] = str || undefined
    } else if (typeof v === 'string') {
      dto[k as keyof Pick<UserApiCredentialsDto, SecretBodyField>] = str === '' ? undefined : str
    } else if (v === null) {
      dto[k as keyof Pick<UserApiCredentialsDto, SecretBodyField>] = undefined
    }
  }

  if (dto.anthropicModel != null) dto.anthropicModel = normalizeAnthropicModel(dto.anthropicModel)
  if (dto.geminiModel != null) dto.geminiModel = normalizeGeminiModel(dto.geminiModel)
  if (dto.openaiModel != null) dto.openaiModel = normalizeOpenaiModel(dto.openaiModel)

  return { ok: true, dto }
}

function decryptSecretsFromDoc(doc: UserApiCredentialsDoc): Partial<
  Pick<UserApiCredentialsDto, SecretBodyField | 'provider'>
> {
  const { keyBuf } = getCredentialsCryptoContext()
  const out: Partial<Pick<UserApiCredentialsDto, SecretBodyField | 'provider'>> = {}
  if (doc.provider) out.provider = doc.provider

  for (const f of SECRET_KEYS) {
    const cipherProp = `${f}Cipher` as keyof UserApiCredentialsDoc
    const plainProp = `${f}Plain` as keyof UserApiCredentialsDoc
    const c = doc[cipherProp]
    const p = doc[plainProp]
    if (typeof c === 'string' && c.trim()) {
      if (!keyBuf) {
        continue
      }
      try {
        const pt = decryptUserSecretCiphertext(c.trim(), keyBuf)
        ;(out as Record<string, string | undefined>)[f] = pt
      } catch {
        // skip corrupt field
      }
    } else if (typeof p === 'string') {
      ;(out as Record<string, string>)[f] = p.trim()
    }
  }

  return out
}

const EMPTY_CREDENTIAL_SNAPSHOT: UserApiCredentialsClientSnapshot = {
  provider: 'anthropic',
  anthropicApiKey: '',
  anthropicModel: normalizeAnthropicModel(undefined),
  geminiApiKey: '',
  geminiModel: normalizeGeminiModel(undefined),
  openaiApiKey: '',
  openaiModel: normalizeOpenaiModel(undefined),
  elevenLabsApiKey: '',
  googleCloudTtsApiKey: '',
}

/** Full credential snapshot for the signed-in credentials API client. Never returns null fields. */
export async function getUserCredentialsClientSnapshot(userId: string): Promise<UserApiCredentialsClientSnapshot> {
  const db = await getDb()
  const doc = await db.collection<UserApiCredentialsDoc>(COLLECTION).findOne({ userId })
  if (!doc) return { ...EMPTY_CREDENTIAL_SNAPSHOT }

  const decrypted = decryptSecretsFromDoc(doc)

  return {
    ...EMPTY_CREDENTIAL_SNAPSHOT,
    provider: decrypted.provider ?? doc.provider ?? 'anthropic',
    anthropicApiKey: decrypted.anthropicApiKey ?? '',
    anthropicModel: normalizeAnthropicModel(doc.anthropicModel),
    geminiApiKey: decrypted.geminiApiKey ?? '',
    geminiModel: normalizeGeminiModel(doc.geminiModel),
    openaiApiKey: decrypted.openaiApiKey ?? '',
    openaiModel: normalizeOpenaiModel(doc.openaiModel),
    elevenLabsApiKey: decrypted.elevenLabsApiKey ?? '',
    googleCloudTtsApiKey: decrypted.googleCloudTtsApiKey ?? '',
  }
}

function mapSecretToDocFields(field: SecretBodyField, plaintext: string, keyBuf: Buffer | null, usePlaintextMongo: boolean): Pick<UserApiCredentialsDoc, CipherPlainKeys> | null {
  const cipherProp = `${field}Cipher`
  const plainProp = `${field}Plain`

  const result: Partial<Record<CipherPlainKeys, string>> = {}

  if (plaintext === '') {
    return null
  }

  if (!plaintext) return null

  if (keyBuf) {
    ;(result as Record<string, string>)[cipherProp] = encryptUserSecretPlaintext(plaintext, keyBuf)
    return result as Pick<UserApiCredentialsDoc, CipherPlainKeys>
  }

  if (usePlaintextMongo) {
    ;(result as Record<string, string>)[plainProp] = plaintext
    return result as Pick<UserApiCredentialsDoc, CipherPlainKeys>
  }

  throw new Error('ENCRYPTION_UNAVAILABLE')
}

/** Merge patch into Mongo; clears secret fields when body sends '' or undefined with field present semantics — only keys present in dto are applied. */
export async function upsertUserApiCredentialsPartial(
  userId: string,
  patch: Partial<UserApiCredentialsDto>,
): Promise<{ error?: 'encryption_unavailable' }> {
  const { keyBuf, usePlaintextMongo } = getCredentialsCryptoContext()

  const $unset: Record<string, ''> = {}
  const $set: Partial<UserApiCredentialsDoc> = {
    updatedAt: new Date(),
  }

  if ('provider' in patch) {
    if (patch.provider) {
      $set.provider = patch.provider as LlmProvider
    } else {
      $unset.provider = ''
    }
  }

  const modelProps = ['anthropicModel', 'geminiModel', 'openaiModel'] as const
  for (const m of modelProps) {
    if (!(m in patch)) continue
    const v = patch[m]
    if (v === undefined || v === '') {
      $unset[m] = ''
    } else {
      $set[m] = v
    }
  }

  try {
    for (const f of SECRET_KEYS) {
      if (!(f in patch)) continue
      const cipherProp = `${f}Cipher`
      const plainProp = `${f}Plain`

      const v = patch[f as keyof Pick<UserApiCredentialsDto, SecretBodyField>]

      const clearSecret = (): void => {
        $unset[cipherProp] = ''
        $unset[plainProp] = ''
      }

      if (v === undefined || v === '') {
        clearSecret()
        continue
      }

      const extra = mapSecretToDocFields(f, v, keyBuf, usePlaintextMongo)
      if (!extra) continue
      const entries = Object.entries(extra) as [CipherPlainKeys, string][]
      for (const [k2, val2] of entries) {
        $set[k2] = val2
      }
      if (cipherProp in extra) $unset[plainProp] = ''
      if (plainProp in extra) $unset[cipherProp] = ''
    }
  } catch {
    return { error: 'encryption_unavailable' }
  }

  const db = await getDb()
  const col = db.collection<UserApiCredentialsDoc>(COLLECTION)

  const updateOps: Record<string, unknown> = {
    $set: $set,
  }
  if (Object.keys($unset).length) {
    updateOps.$unset = $unset
  }

  await col.updateOne(
    { userId },
    {
      ...updateOps,
      $setOnInsert: { userId, createdAt: new Date() },
    },
    { upsert: true },
  )

  return {}
}
