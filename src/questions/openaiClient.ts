import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { DEFAULT_OPENAI_MODEL } from './openaiConstants'
import { appendLocaleToSystemPrompt } from './llmLocale'

function messageText(content: MessageParam['content']): string {
  if (typeof content === 'string') return content
  return content
    .map((b) => ('type' in b && b.type === 'text' && 'text' in b ? String(b.text) : ''))
    .join('')
}

export async function streamOpenAIChatMessage(params: {
  apiKey: string
  model: string
  system: string
  messages: MessageParam[]
  maxTokens?: number
  locale?: string
  onTextDelta: (delta: string) => void
}): Promise<void> {
  const system = appendLocaleToSystemPrompt(params.system, params.locale)
  const client = new OpenAI({
    apiKey: params.apiKey,
    dangerouslyAllowBrowser: true,
  })
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...params.messages.map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: messageText(m.content),
    })),
  ]

  const stream = await client.chat.completions.create({
    model: params.model.trim() || DEFAULT_OPENAI_MODEL,
    messages: openaiMessages,
    stream: true,
    max_tokens: params.maxTokens ?? 4096,
  })

  for await (const chunk of stream) {
    const d = chunk.choices[0]?.delta?.content
    if (d) params.onTextDelta(d)
  }
}
