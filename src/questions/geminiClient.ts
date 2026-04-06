import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { DEFAULT_GEMINI_MODEL } from './geminiConstants'
import { appendLocaleToSystemPrompt } from './llmLocale'

function messageText(content: MessageParam['content']): string {
  if (typeof content === 'string') return content
  return content
    .map((b) => ('type' in b && b.type === 'text' && 'text' in b ? String(b.text) : ''))
    .join('')
}

export async function streamGeminiChatMessage(params: {
  apiKey: string
  model: string
  system: string
  messages: MessageParam[]
  maxTokens?: number
  locale?: string
  onTextDelta: (delta: string) => void
}): Promise<void> {
  const system = appendLocaleToSystemPrompt(params.system, params.locale)
  const genAI = new GoogleGenerativeAI(params.apiKey)
  const model = genAI.getGenerativeModel({
    model: params.model.trim() || DEFAULT_GEMINI_MODEL,
    systemInstruction: system,
    generationConfig: { maxOutputTokens: params.maxTokens ?? 4096 },
  })
  const msgs = params.messages
  if (msgs.length === 0) return
  const last = msgs[msgs.length - 1]!
  if (last.role !== 'user') {
    throw new Error('Conversation must end with a user message')
  }
  const history = msgs.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: messageText(m.content) }],
  }))

  const chat = model.startChat({ history })
  const stream = await chat.sendMessageStream(messageText(last.content))
  for await (const chunk of stream.stream) {
    const t = chunk.text()
    if (t) params.onTextDelta(t)
  }
}
