import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { appendLocaleToSystemPrompt } from './llmLocale'

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

export { appendLocaleToSystemPrompt }

export async function streamChatMessage(params: {
  apiKey: string
  model: string
  system: string
  messages: MessageParam[]
  maxTokens?: number
  /** BCP-47 language tag (e.g. from app locale); forwarded into the system prompt. */
  locale?: string
  onTextDelta: (delta: string) => void
}): Promise<void> {
  const client = createAnthropicClient(params.apiKey)
  const system = appendLocaleToSystemPrompt(params.system, params.locale)
  const stream = client.messages.stream({
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    system,
    messages: params.messages,
  })

  stream.on('text', (delta) => params.onTextDelta(delta))
  await stream.finalText()
}

export function formatApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return String(err)
}
