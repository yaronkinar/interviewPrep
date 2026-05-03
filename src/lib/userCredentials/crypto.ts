import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function deriveKeyFromEnv(): Buffer | null {
  const raw = process.env.USER_CREDENTIALS_ENCRYPTION_KEY?.trim()
  if (!raw) return null
  return createHash('sha256').update(raw, 'utf8').digest()
}

/** Returns AES-256-GCM ciphertext as base64url (iv ‖ tag ‖ payload). Throws if decryption fails or key/env invalid in production without key at write time handled by caller. */
export function encryptUserSecretPlaintext(plaintext: string, keyBuf: Buffer): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, keyBuf, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url')
}

export function decryptUserSecretCiphertext(encoded: string, keyBuf: Buffer): string {
  const buf = Buffer.from(encoded, 'base64url')
  if (buf.length < 12 + 16) {
    throw new Error('invalid_ciphertext_length')
  }
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const ciphertext = buf.subarray(28)
  const decipher = createDecipheriv(ALGORITHM, keyBuf, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

export interface CredentialsCryptoContext {
  keyBuf: Buffer | null
  usePlaintextMongo: boolean
}

export function getCredentialsCryptoContext(): CredentialsCryptoContext {
  const keyBuf = deriveKeyFromEnv()
  const usePlaintextMongo = keyBuf === null && process.env.NODE_ENV !== 'production'
  return { keyBuf, usePlaintextMongo }
}
