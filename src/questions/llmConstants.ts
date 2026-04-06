export type LlmProvider = 'anthropic' | 'gemini' | 'openai'

export const LLM_PROVIDER_STORAGE_KEY = 'interviews:llmProvider'

export function normalizeLlmProvider(stored: string | null | undefined): LlmProvider {
  if (stored === 'gemini') return 'gemini'
  if (stored === 'openai') return 'openai'
  return 'anthropic'
}
