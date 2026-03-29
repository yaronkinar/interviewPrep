/** Languages we treat as likely React/JS source when scoring blocks. */
const REACTISH_LANGS = new Set([
  'tsx',
  'jsx',
  'ts',
  'typescript',
  'javascript',
  'js',
  'mjs',
  'cjs',
])

/** Normalize common Unicode “backtick” lookalikes to ASCII ` (U+0060). */
function normalizeBackticks(text: string): string {
  return text
    .replace(/\uFF40/g, '`') // fullwidth grave
    .replace(/\u201A/g, '`') // single low-9 quotation mark (sometimes pasted as backtick)
    .replace(/\u2032/g, '`') // prime
}

function scoreBlock(lang: string, code: string): number {
  const L = lang.toLowerCase().trim()
  const c = code.trim()
  if (!c) return -1

  let s = 0
  if (L === 'tsx' || L === 'jsx') s += 120
  else if (REACTISH_LANGS.has(L)) s += 70
  else if (!L) s += 15

  if (/<\/?[A-Za-z][\w.]*(?:\s|>)/.test(c) || /return\s*\(\s*</.test(c)) s += 45
  if (/\b(useState|useEffect|useMemo|useCallback|useRef|Fragment)\b/.test(c)) s += 35
  if (/\b(function\s+App|const\s+App\s*=|export\s+default\s+function)/.test(c)) s += 40
  if (/\bReact\.(createElement|useState)/.test(c)) s += 25

  return s
}

/** True if the first line of a fence looks like a language tag, not source code. */
function looksLikeFenceLang(firstLine: string): boolean {
  const s = firstLine.trim()
  if (!s || s.length > 40) return false
  if (/\s/.test(s)) return false
  if (/[(){}\[\]=;`'"]/.test(s)) return false
  return /^[\w.#+-]+$/.test(s)
}

/** Parse ```lang\ncode``` by splitting (more tolerant than a single brittle regex). */
function extractTripleBacktickBlocks(text: string): { lang: string; code: string }[] {
  const n = normalizeBackticks(text)
  const chunks = n.split('```')
  const out: { lang: string; code: string }[] = []

  for (let i = 1; i < chunks.length; i += 2) {
    const raw = chunks[i]
    if (raw === undefined) continue
    const trimmed = raw.replace(/^\r?\n/, '')
    const nl = trimmed.search(/\r?\n/)
    let lang = ''
    let code = trimmed

    if (nl === -1) {
      if (looksLikeFenceLang(trimmed)) {
        lang = trimmed.trim()
        code = ''
      } else {
        lang = ''
        code = trimmed
      }
    } else {
      const firstLine = trimmed.slice(0, nl).trim()
      const rest = trimmed.slice(nl + 1)
      if (looksLikeFenceLang(firstLine)) {
        lang = firstLine
        code = rest
      } else {
        lang = ''
        code = trimmed
      }
    }

    const c = code.replace(/\s+$/, '').trim()
    if (c) out.push({ lang, code: c })
  }

  return out
}

/** Parse ~~~lang\ncode~~~ */
function extractTildeBlocks(text: string): { lang: string; code: string }[] {
  const n = normalizeBackticks(text)
  const chunks = n.split('~~~')
  const out: { lang: string; code: string }[] = []

  for (let i = 1; i < chunks.length; i += 2) {
    const raw = chunks[i]
    if (raw === undefined) continue
    const trimmed = raw.replace(/^\r?\n/, '')
    const nl = trimmed.search(/\r?\n/)
    let lang = ''
    let code = trimmed

    if (nl === -1) {
      if (looksLikeFenceLang(trimmed)) {
        lang = trimmed.trim()
        code = ''
      } else {
        lang = ''
        code = trimmed
      }
    } else {
      const firstLine = trimmed.slice(0, nl).trim()
      const rest = trimmed.slice(nl + 1)
      if (looksLikeFenceLang(firstLine)) {
        lang = firstLine
        code = rest
      } else {
        lang = ''
        code = trimmed
      }
    }

    const c = code.replace(/\s+$/, '').trim()
    if (c) out.push({ lang, code: c })
  }

  return out
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

/** HTML: <pre><code class="language-tsx">… or standalone <code>… */
function extractHtmlCodeBlocks(text: string): { lang: string; code: string }[] {
  const out: { lang: string; code: string }[] = []
  const preRe = /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi
  let m: RegExpExecArray | null
  while ((m = preRe.exec(text)) !== null) {
    const attrs = m[1] || ''
    const langMatch = /language-([\w-]+)/i.exec(attrs)
    const lang = langMatch ? langMatch[1] : ''
    const code = decodeHtmlEntities(m[2] || '').trim()
    if (code) out.push({ lang, code })
  }
  if (out.length > 0) return out

  const codeRe = /<code([^>]*)>([\s\S]{30,}?)<\/code>/gi
  while ((m = codeRe.exec(text)) !== null) {
    const attrs = m[1] || ''
    if (/hljs-meta|hljs-keyword/.test(attrs) && !/language-/.test(attrs)) continue
    const langMatch = /language-([\w-]+)/i.exec(attrs)
    const lang = langMatch ? langMatch[1] : ''
    const code = decodeHtmlEntities(m[2] || '').trim()
    if (code.includes('<') && code.includes('>') && code.length > 40) out.push({ lang, code })
  }
  return out
}

/** When Claude sends raw code with no fences (paragraph of JS/TS). */
function extractUnfencedReactish(text: string): string | null {
  const t = text.trim()
  if (t.length < 30) return null

  const lines = t.split(/\r?\n/)
  let start = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (
      /^(import\s+|export\s+(default\s+)?(function|const|class)|function\s+\w|const\s+\w+\s*=|let\s+\w+\s*=|type\s+\w|interface\s+\w)/.test(
        line,
      )
    ) {
      start = i
      break
    }
  }
  if (start === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(return\s*\(\s*<|<[A-Za-z])/.test(lines[i])) {
        start = i
        break
      }
    }
  }

  if (start === -1) {
    const joined = lines.join('\n')
    if (
      joined.length > 50 &&
      /\b(useState|useEffect|useMemo|useCallback)\s*\(/.test(joined) &&
      /<\/?[A-Za-z]/.test(joined)
    ) {
      return joined.trim()
    }
    return null
  }

  const slice = lines.slice(start).join('\n')
  if (slice.length < 35) return null
  if (!/\b(function|const|=>|return\s*\(|<[A-Za-z])/.test(slice)) return null

  return slice.trim()
}

function pickBestBlock(blocks: { lang: string; code: string }[]): string | null {
  if (blocks.length === 0) return null

  const tsxFirst = blocks.find((b) => {
    const L = b.lang.toLowerCase()
    return L === 'tsx' || L === 'jsx'
  })
  if (tsxFirst) return tsxFirst.code

  const reactishFirst = blocks.find((b) => REACTISH_LANGS.has(b.lang.toLowerCase()))
  if (reactishFirst) return reactishFirst.code

  let best: { lang: string; code: string } | null = null
  let bestScore = -1
  for (const b of blocks) {
    const sc = scoreBlock(b.lang, b.code)
    if (sc > bestScore) {
      bestScore = sc
      best = b
    }
  }
  if (best && bestScore >= 25) return best.code

  const ranked = [...blocks].sort((a, b) => {
    const ds = scoreBlock(b.lang, b.code) - scoreBlock(a.lang, a.code)
    if (ds !== 0) return ds
    return b.code.length - a.code.length
  })
  const fallback = ranked.find((b) => b.code.length > 8 && scoreBlock(b.lang, b.code) >= 0)
  if (fallback) return fallback.code

  return best?.code ?? ranked[0]?.code ?? null
}

/**
 * Pull React/TS code from assistant markdown: ``` fences, ~~~ fences, HTML code blocks,
 * or unfenced source when it looks like a component.
 */
export function extractReactCodeFromMarkdown(text: string): string | null {
  const t = text.trim()
  if (!t) return null

  const backtickBlocks = extractTripleBacktickBlocks(t)
  if (backtickBlocks.length > 0) {
    const picked = pickBestBlock(backtickBlocks)
    if (picked) return picked
  }

  const tildeBlocks = extractTildeBlocks(t)
  if (tildeBlocks.length > 0) {
    const picked = pickBestBlock(tildeBlocks)
    if (picked) return picked
  }

  const htmlBlocks = extractHtmlCodeBlocks(t)
  if (htmlBlocks.length > 0) {
    const picked = pickBestBlock(htmlBlocks)
    if (picked) return picked
  }

  return extractUnfencedReactish(t)
}
