import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

export async function streamChatMessage(params: {
  apiKey: string
  model: string
  system: string
  messages: MessageParam[]
  maxTokens?: number
  onTextDelta: (delta: string) => void
}): Promise<void> {
  const client = createAnthropicClient(params.apiKey)
  const stream = client.messages.stream({
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
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
