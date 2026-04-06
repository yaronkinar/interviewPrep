import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { streamChatMessage } from './anthropicClient'
import { streamGeminiChatMessage } from './geminiClient'
import type { LlmProvider } from './llmConstants'
import { streamOpenAIChatMessage } from './openaiClient'

export { formatApiError } from './anthropicClient'

export async function streamLlmChat(params: {
  provider: LlmProvider
  apiKey: string
  model: string
  system: string
  messages: MessageParam[]
  maxTokens?: number
  locale?: string
  onTextDelta: (delta: string) => void
}): Promise<void> {
  const { provider, ...rest } = params
  if (provider === 'gemini') {
    return streamGeminiChatMessage(rest)
  }
  if (provider === 'openai') {
    return streamOpenAIChatMessage(rest)
  }
  return streamChatMessage(rest)
}
