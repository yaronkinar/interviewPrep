import type { LlmProvider } from '@/questions/llmConstants'

/** Fields returned to authenticated client — plaintext secrets. */
export interface UserApiCredentialsDto {
  provider?: LlmProvider
  anthropicApiKey?: string
  anthropicModel?: string
  geminiApiKey?: string
  geminiModel?: string
  openaiApiKey?: string
  openaiModel?: string
  elevenLabsApiKey?: string
  googleCloudTtsApiKey?: string
}

export interface UserApiCredentialsDoc {
  userId: string
  provider?: LlmProvider
  anthropicModel?: string
  geminiModel?: string
  openaiModel?: string
  anthropicApiKeyCipher?: string
  geminiApiKeyCipher?: string
  openaiApiKeyCipher?: string
  elevenLabsApiKeyCipher?: string
  googleCloudTtsApiKeyCipher?: string
  anthropicApiKeyPlain?: string
  geminiApiKeyPlain?: string
  openaiApiKeyPlain?: string
  elevenLabsApiKeyPlain?: string
  googleCloudTtsApiKeyPlain?: string
  createdAt: Date
  updatedAt: Date
}

/** Stable shape for GET /api/user-api-credentials (all fields present for deterministic client merge). */
export interface UserApiCredentialsClientSnapshot extends UserApiCredentialsDto {
  provider: LlmProvider
  anthropicApiKey: string
  anthropicModel: string
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  openaiModel: string
  elevenLabsApiKey: string
  googleCloudTtsApiKey: string
}
