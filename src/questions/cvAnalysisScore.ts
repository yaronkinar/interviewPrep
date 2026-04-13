/** Line 1: `CV_SCORE: 0-100 | short label` */
const SCORE_LINE_RE = /^CV_SCORE:\s*(\d{1,3})\s*\|\s*(.+)$/i
const DIMENSIONS_LINE_RE = /^CV_DIMENSIONS:\s*(.+)$/i
const STEPS_LINE_RE = /^CV_STEPS:\s*(.+)$/i

export type CvScoreBlock = {
  score: number
  summary: string
}

export type CvDimensions = {
  ats: number
  fit: number
  clarity: number
}

export type CvNextStep = {
  t: string
  d?: string
  c?: string
}

export type ParsedCvAnalysis = {
  score: CvScoreBlock | null
  dimensions: CvDimensions | null
  steps: CvNextStep[]
  displayMarkdown: string
}

function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(100, Math.max(0, n))
}

function splitFirstLine(s: string): { line: string; rest: string } {
  const i = s.indexOf('\n')
  if (i === -1) return { line: s, rest: '' }
  return { line: s.slice(0, i), rest: s.slice(i + 1) }
}

function parseDimensionsLine(line: string): CvDimensions | null {
  const m = line.match(DIMENSIONS_LINE_RE)
  if (!m) return null
  try {
    const obj = JSON.parse(m[1].trim()) as Record<string, unknown>
    if (!('ats' in obj && 'fit' in obj && 'clarity' in obj)) return null
    return {
      ats: clampScore(Number(obj.ats)),
      fit: clampScore(Number(obj.fit)),
      clarity: clampScore(Number(obj.clarity)),
    }
  } catch {
    return null
  }
}

function parseStepsLine(line: string): CvNextStep[] | null {
  const m = line.match(STEPS_LINE_RE)
  if (!m) return null
  try {
    const arr = JSON.parse(m[1].trim()) as unknown
    if (!Array.isArray(arr)) return null
    const out: CvNextStep[] = []
    for (const item of arr) {
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      const t = typeof o.t === 'string' ? o.t.trim() : ''
      if (!t) continue
      const step: CvNextStep = { t }
      if (typeof o.d === 'string' && o.d.trim()) step.d = o.d.trim()
      if (typeof o.c === 'string' && o.c.trim()) step.c = o.c.trim()
      out.push(step)
      if (out.length >= 8) break
    }
    return out
  } catch {
    return null
  }
}

/**
 * Parses optional prefix: CV_SCORE, then CV_DIMENSIONS + CV_STEPS, or CV_STEPS only, then Markdown.
 * Returns empty displayMarkdown while CV_SCORE or following JSON lines are incomplete (unparseable).
 */
export function parseCvAnalysisResponse(raw: string): ParsedCvAnalysis {
  const trimmed = raw.trimStart()
  const firstNl = trimmed.indexOf('\n')
  const firstLine = firstNl === -1 ? trimmed : trimmed.slice(0, firstNl)
  const afterFirst = firstNl === -1 ? '' : trimmed.slice(firstNl + 1)

  const sm = firstLine.match(SCORE_LINE_RE)
  if (!sm) {
    if (/^CV_SCORE:/i.test(firstLine) && firstNl === -1) {
      return { score: null, dimensions: null, steps: [], displayMarkdown: '' }
    }
    return { score: null, dimensions: null, steps: [], displayMarkdown: raw }
  }

  const summary = sm[2].trim()
  if (!summary) {
    return { score: null, dimensions: null, steps: [], displayMarkdown: raw }
  }

  const score: CvScoreBlock = { score: clampScore(parseInt(sm[1], 10)), summary }
  let tail = afterFirst.trimStart()

  if (!tail) {
    return { score, dimensions: null, steps: [], displayMarkdown: '' }
  }

  const { line: l2, rest: r2 } = splitFirstLine(tail)

  if (/^CV_DIMENSIONS:/i.test(l2)) {
    const d = parseDimensionsLine(l2)
    if (!d) {
      return { score, dimensions: null, steps: [], displayMarkdown: '' }
    }
    tail = r2.trimStart()
    if (!tail) {
      return { score, dimensions: d, steps: [], displayMarkdown: '' }
    }
    const { line: l3, rest: r3 } = splitFirstLine(tail)
    if (/^CV_STEPS:/i.test(l3)) {
      const st = parseStepsLine(l3)
      if (st === null) {
        return { score, dimensions: d, steps: [], displayMarkdown: '' }
      }
      return { score, dimensions: d, steps: st, displayMarkdown: r3.trimStart() }
    }
    return { score, dimensions: d, steps: [], displayMarkdown: tail }
  }

  if (/^CV_STEPS:/i.test(l2)) {
    const st = parseStepsLine(l2)
    if (st === null) {
      return { score, dimensions: null, steps: [], displayMarkdown: '' }
    }
    return { score, dimensions: null, steps: st, displayMarkdown: r2.trimStart() }
  }

  return { score, dimensions: null, steps: [], displayMarkdown: tail }
}
