/**
 * Letter-size PDF résumé from the same parsed model as the DOCX export (Yaron-style palette).
 */

import type { JobBlock, ResumeModel, ResumeSection } from './cvYaronResumeModel'
import { parseCvPlainTextToResumeModel, resumeFileBaseName } from './cvYaronResumeModel'

type JsPdfInstance = InstanceType<typeof import('jspdf').jsPDF>
type JsPdfClass = typeof import('jspdf').jsPDF

const DATE_IN_LINE =
  /\d{2}\/\d{4}|\b20\d{2}\s*[–—-]\s*(?:20\d{2}|Present|Current)\b|\b20\d{2}\s*-\s*(?:20\d{2}|Present|Current)\b/i

function splitCompanyAndDates(companyLine: string): { company: string; dates: string } {
  const t = companyLine.replace(/\t/g, '    ').trim()
  const spaced = t.match(/^(.+?)\s{2,}(.+)$/)
  if (spaced && DATE_IN_LINE.test(spaced[2])) {
    return { company: spaced[1].trim(), dates: spaced[2].trim() }
  }
  const tail = t.match(/^(.+?)\s+(\d{2}\/\d{4}[\s\S]+|\d{4}\s*[–—-]\s*[\s\S]+)$/i)
  if (tail) {
    return { company: tail[1].trim(), dates: tail[2].trim() }
  }
  return { company: t, dates: '' }
}

const C = {
  name: '#0E1C2F',
  tag: '#3B82F6',
  muted: '#8DA0B8',
  body: '#1A2332',
  summary: '#3A4A5C',
  skill: '#555F6E',
  rule: [59, 130, 246] as [number, number, number],
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function renderModelToPdf(JsPDF: JsPdfClass, model: ResumeModel): JsPdfInstance {
  const doc = new JsPDF({ unit: 'pt', format: 'letter' })
  const M = 54
  const W = 612
  const H = 792
  const maxW = W - 2 * M
  let y = M

  const ensure = (need: number) => {
    if (y + need > H - M) {
      doc.addPage()
      y = M
    }
  }

  const writeLines = (
    text: string,
    fontSize: number,
    opts: {
      font?: 'helvetica' | 'courier' | 'times'
      style?: 'normal' | 'bold' | 'italic' | 'bolditalic'
      color?: [number, number, number]
      indent?: number
      gapAfter?: number
    } = {},
  ) => {
    const font = opts.font ?? 'helvetica'
    const style = opts.style ?? 'normal'
    const indent = opts.indent ?? 0
    const color = opts.color ?? hexRgb(C.body)
    doc.setFont(font, style)
    doc.setFontSize(fontSize)
    doc.setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(text.trim(), maxW - indent)
    const lh = fontSize * 1.28
    ensure(lines.length * lh + (opts.gapAfter ?? 8))
    let yy = y
    for (const line of lines) {
      ensure(lh + 2)
      doc.text(line, M + indent, yy)
      yy += lh
    }
    y = yy + (opts.gapAfter ?? 6)
  }

  const drawRule = () => {
    ensure(14)
    doc.setDrawColor(C.rule[0], C.rule[1], C.rule[2])
    doc.setLineWidth(0.75)
    doc.line(M, y, W - M, y)
    y += 12
  }

  writeLines(model.name, 26, { style: 'bold', color: hexRgb(C.name), gapAfter: 8 })

  if (model.tagline.trim()) {
    writeLines(model.tagline.toUpperCase(), 9, {
      font: 'courier',
      style: 'bold',
      color: hexRgb(C.tag),
      gapAfter: 6,
    })
  }

  if (model.contact.trim()) {
    writeLines(model.contact, 9, { font: 'courier', color: hexRgb(C.muted), gapAfter: 4 })
  }

  drawRule()

  if (model.summary.trim()) {
    writeLines(model.summary, 10, { color: hexRgb(C.summary), gapAfter: 14 })
  }

  const drawSectionHeader = (title: string) => {
    writeLines(title.toUpperCase(), 9, {
      font: 'courier',
      style: 'bold',
      color: hexRgb(C.tag),
      gapAfter: 6,
    })
    drawRule()
  }

  const bullet = (t: string) => {
    writeLines(`• ${t.trim()}`, 10, { indent: 10, gapAfter: 4 })
  }

  const jobBlock = (job: JobBlock) => {
    const { company, dates } = splitCompanyAndDates(job.companyLine)
    const companyText = company || job.companyLine
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...hexRgb(C.body))
    const companyLines = doc.splitTextToSize(companyText, dates ? maxW * 0.55 : maxW)
    const lh = 14
    ensure(companyLines.length * lh + 8)
    let yy = y
    for (const cl of companyLines) {
      ensure(lh)
      doc.text(cl, M, yy)
      yy += lh
    }
    if (dates) {
      doc.setFont('courier', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...hexRgb(C.muted))
      const dateLines = doc.splitTextToSize(dates, maxW * 0.42)
      let dy = y
      for (const dl of dateLines) {
        doc.text(dl, W - M, dy, { align: 'right' })
        dy += lh * 0.85
      }
      y = Math.max(yy, dy)
    } else {
      y = yy
    }
    y += 6

    if (job.role.trim()) {
      writeLines(job.role, 9.5, { style: 'italic', color: hexRgb(C.tag), gapAfter: 6 })
    }
    for (const b of job.bullets) {
      if (b.trim()) bullet(b)
    }
    y += 4
  }

  const pushSection = (sec: ResumeSection) => {
    if (sec.kind === 'summary') {
      drawSectionHeader(sec.title)
      for (const p of sec.paragraphs) {
        if (p.trim()) writeLines(p, 10, { color: hexRgb(C.summary), gapAfter: 8 })
      }
      return
    }
    if (sec.kind === 'skills') {
      drawSectionHeader(sec.title)
      for (const row of sec.rows) {
        const line = row.label ? `${row.label} ${row.value}`.trim() : row.value.trim()
        if (line) writeLines(line, 10, { gapAfter: 6 })
      }
      y += 6
      return
    }
    if (sec.kind === 'experience') {
      drawSectionHeader(sec.title)
      for (const j of sec.jobs) jobBlock(j)
      return
    }
    if (sec.kind === 'education') {
      drawSectionHeader(sec.title)
      const [first, ...rest] = sec.lines
      if (first?.trim()) writeLines(first.trim(), 10, { style: 'bold', gapAfter: 6 })
      if (rest.length) writeLines(rest.join(' · '), 9.5, { color: hexRgb(C.muted), gapAfter: 12 })
      return
    }
    if (sec.kind === 'bullets') {
      drawSectionHeader(sec.title)
      for (const item of sec.items) {
        if (item.trim()) bullet(item)
      }
      y += 6
      return
    }
    drawSectionHeader(sec.title)
    for (const line of sec.lines) {
      if (line.trim()) writeLines(line.trim(), 10, { gapAfter: 6 })
    }
  }

  for (const sec of model.sections) {
    pushSection(sec)
  }

  return doc
}

export async function plainTextToYaronStylePdf(
  raw: string,
): Promise<{ blob: Blob; baseName: string } | null> {
  const text = raw.trim()
  if (!text) return null
  const { jsPDF } = await import('jspdf')
  const model = parseCvPlainTextToResumeModel(text)
  if (!model.name.trim()) return null
  const doc = renderModelToPdf(jsPDF, model)
  return { blob: doc.output('blob'), baseName: resumeFileBaseName(model) }
}
