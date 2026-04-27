export type TavilySearchResult = {
  title: string
  url: string
  content: string
}

type TavilyResponse = {
  results?: { title?: string; url?: string; content?: string }[]
  answer?: string
}

export function resolveTavilyApiKey() {
  return process.env.TAVILY_API_KEY?.trim() || ''
}

/** Tavily expects `Authorization: Bearer tvly-...` (not `api_key` in the body). */
function tavilyBearerToken(apiKey: string) {
  const key = apiKey.trim()
  if (key.toLowerCase().startsWith('bearer ')) return key.slice(7).trim()
  return key
}

export async function tavilySearch(options: {
  query: string
  apiKey: string
  maxResults: number
}): Promise<{ results: TavilySearchResult[]; answer?: string }> {
  const token = tavilyBearerToken(options.apiKey)
  if (!token) {
    throw new Error('Tavily API key is empty.')
  }

  const body = {
    query: options.query,
    max_results: options.maxResults,
    search_depth: 'basic' as const,
    include_answer: true,
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Tavily search failed (${response.status}): ${text.slice(0, 300)}`)
  }

  let parsed: TavilyResponse
  try {
    parsed = JSON.parse(text) as TavilyResponse
  } catch {
    throw new Error('Tavily search returned invalid JSON.')
  }

  const raw = Array.isArray(parsed.results) ? parsed.results : []
  const results = raw
    .map((item, index) => {
      const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Result ${index + 1}`
      const url = typeof item.url === 'string' && item.url.trim() ? item.url.trim() : ''
      const content = typeof item.content === 'string' ? item.content.trim() : ''
      return { title, url, content }
    })
    .filter(item => item.content.length > 0 || item.url.length > 0)

  const answer = typeof parsed.answer === 'string' && parsed.answer.trim() ? parsed.answer.trim() : undefined
  return { results, answer }
}

export function formatTavilyResultsForPrompt(results: TavilySearchResult[], answer?: string) {
  const lines: string[] = []
  if (answer?.trim()) {
    lines.push('Search summary (may be helpful):', answer.trim(), '')
  }
  lines.push('Web results:')
  for (const r of results) {
    const header = r.url ? `${r.title} — ${r.url}` : r.title
    lines.push(`- ${header}`, r.content ? `  ${r.content}` : '', '')
  }
  return lines.filter(Boolean).join('\n')
}
