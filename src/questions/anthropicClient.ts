import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

/** Appends a fixed English instruction so the model matches the user's UI locale (BCP-47). */
export function appendLocaleToSystemPrompt(system: string, locale?: string): string {
  const code = locale?.trim()
  if (!code) return system
  let label = code
  try {
    const base = code.split('-')[0] ?? code
    label = new Intl.DisplayNames([code], { type: 'language' }).of(base) ?? code
  } catch {
    /* keep code */
  }
  return `${system}\n\n[User interface language: ${label} (locale: ${code}). Write assistant replies in this language unless the user writes in another language—then match the user's language.]`
}

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
