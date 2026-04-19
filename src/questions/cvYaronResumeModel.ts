/** Heuristic parse of plain-text CV into blocks for the “Yaron-style” Word layout. */

export type JobBlock = {
  companyLine: string
  role: string
  bullets: string[]
}

export type ResumeSection =
  | { kind: 'summary'; title: string; paragraphs: string[] }
  | { kind: 'skills'; title: string; rows: Array<{ label: string; value: string }> }
  | { kind: 'experience'; title: string; jobs: JobBlock[] }
  | { kind: 'education'; title: string; lines: string[] }
  | { kind: 'bullets'; title: string; items: string[] }
  | { kind: 'generic'; title: string; lines: string[] }

export type ResumeModel = {
  name: string
  tagline: string
  contact: string
  summary: string
  sections: ResumeSection[]
}

const SECTION_ALIASES: Record<string, ResumeSection['kind']> = {
  skills: 'skills',
  'technical skills': 'skills',
  'work history': 'experience',
  experience: 'experience',
  'professional experience': 'experience',
  'employment history': 'experience',
  education: 'education',
  accomplishments: 'bullets',
  awards: 'bullets',
  projects: 'bullets',
  certifications: 'bullets',
  languages: 'bullets',
  publications: 'bullets',
  summary: 'summary',
  profile: 'summary',
  about: 'summary',
  objective: 'summary',
}

const DATE_IN_LINE =
  /\d{2}\/\d{4}|\b20\d{2}\s*[–—-]\s*(?:20\d{2}|Present|Current)\b|\b20\d{2}\s*-\s*(?:20\d{2}|Present|Current)\b/i

const DATE_ONLY_LINE =
  /^(?:\d{2}\/\d{4}\s*[–—-]\s*\d{2}\/\d{4}|\d{4}\s*[–—-]\s*(?:\d{4}|Present|Current)|\d{2}\/\d{4}\s*-\s*\d{2}\/\d{4})/i

function normalizeLines(raw: string): string[] {
  return raw.replace(/\r\n/g, '\n').split('\n')
}

function trimLines(lines: string[]): string[] {
  return lines.map((l) => l.trim())
}

export function isSectionHeader(line: string): boolean {
  const t = line.trim()
  if (!t) return false
  const key = t.replace(/\s+/g, ' ').toLowerCase()
  if (SECTION_ALIASES[key]) return true
  if (t.length >= 4 && t.length <= 52 && /^[A-Z0-9][A-Z0-9 &/+\-·|]+$/.test(t)) {
    const letters = t.replace(/[^A-Za-z]/g, '')
    return letters.length >= 3 && letters === letters.toUpperCase()
  }
  return false
}

function sectionKindForTitle(title: string): ResumeSection['kind'] {
  const key = title.replace(/\s+/g, ' ').trim().toLowerCase()
  return SECTION_ALIASES[key] ?? 'generic'
}

function stripBullet(s: string): string {
  return s.replace(/^[-•*·]\s*/, '').trim()
}

function parseExperienceLines(lines: string[]): JobBlock[] {
  const L = trimLines(lines).filter((l) => l.length > 0)
  const jobs: JobBlock[] = []
  let i = 0
  while (i < L.length) {
    let companyLine = L[i]
    i++
    if (i < L.length && DATE_ONLY_LINE.test(L[i]) && !DATE_IN_LINE.test(companyLine)) {
      companyLine = `${companyLine}    ${L[i]}`
      i++
    }
    let role = ''
    if (i < L.length && !/^[-•*·]/.test(L[i]) && L[i].length <= 115) {
      role = L[i]
      i++
    }
    const bullets: string[] = []
    while (i < L.length) {
      const t = L[i]
      if (/^[-•*·]/.test(t)) {
        bullets.push(stripBullet(t))
        i++
        continue
      }
      if (bullets.length > 0 && DATE_IN_LINE.test(t) && t.length < 170) break
      if (
        bullets.length > 0 &&
        t.length < 96 &&
        /^[A-Z0-9]/.test(t) &&
        !/\.\s/.test(t) &&
        (DATE_IN_LINE.test(t) || !t.includes(':'))
      ) {
        break
      }
      bullets.push(t)
      i++
    }
    jobs.push({ companyLine, role, bullets })
  }
  return jobs.filter((j) => j.companyLine.length > 0)
}

function parseSkillsLines(lines: string[]): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = []
  for (const line of trimLines(lines)) {
    if (!line) continue
    const m = line.match(/^(.{1,48}?):\s*(.+)$/)
    if (m) rows.push({ label: `${m[1].trim()}:`, value: m[2].trim() })
    else rows.push({ label: '', value: line })
  }
  return rows
}

/** Parse pasted / extracted résumé text into a structured model for DOCX export. */
export function parseCvPlainTextToResumeModel(raw: string): ResumeModel {
  const lines = normalizeLines(raw)
  const trimmed = trimLines(lines)
  let i = 0
  const name = (trimmed[i] ?? 'Your name').trim() || 'Your name'
  i++

  let tagline = ''
  if (i < trimmed.length && trimmed[i] && !isSectionHeader(trimmed[i]) && trimmed[i].length <= 140) {
    tagline = trimmed[i]
    i++
  }

  const contactParts: string[] = []
  while (i < trimmed.length && trimmed[i] && !isSectionHeader(trimmed[i]) && trimmed[i].length <= 220) {
    contactParts.push(trimmed[i])
    i++
    if (contactParts.length >= 6) break
  }
  const contact = contactParts.join(' · ')

  while (i < trimmed.length && !trimmed[i]) i++
  const summaryParts: string[] = []
  while (i < trimmed.length && trimmed[i] && !isSectionHeader(trimmed[i])) {
    summaryParts.push(trimmed[i])
    i++
  }
  const summary = summaryParts.join('\n\n').trim()

  const sections: ResumeSection[] = []

  while (i < trimmed.length) {
    while (i < trimmed.length && !trimmed[i]) i++
    if (i >= trimmed.length) break
    const title = trimmed[i]
    i++
    if (!isSectionHeader(title)) continue
    const kind = sectionKindForTitle(title)
    const body: string[] = []
    while (i < trimmed.length && trimmed[i] && !isSectionHeader(trimmed[i])) {
      body.push(trimmed[i])
      i++
    }

    if (kind === 'skills') {
      sections.push({ kind: 'skills', title, rows: parseSkillsLines(body) })
    } else if (kind === 'experience') {
      sections.push({ kind: 'experience', title, jobs: parseExperienceLines(body) })
    } else if (kind === 'education') {
      sections.push({ kind: 'education', title, lines: body })
    } else if (kind === 'bullets') {
      const items = body.flatMap((line) =>
        /^[-•*·]/.test(line) ? [stripBullet(line)] : line ? [line] : [],
      )
      sections.push({ kind: 'bullets', title, items })
    } else if (kind === 'summary') {
      sections.push({ kind: 'summary', title, paragraphs: body.length ? body : [title] })
    } else {
      sections.push({ kind: 'generic', title, lines: body })
    }
  }

  return { name, tagline, contact, summary, sections }
}

export function resumeFileBaseName(model: ResumeModel): string {
  const base = model.name
    .replace(/[^a-zA-Z0-9\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 48)
  return base || 'Resume'
}
