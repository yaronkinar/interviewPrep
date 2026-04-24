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
  const PAGE_W = doc.internal.pageSize.getWidth()
  const PAGE_H = doc.internal.pageSize.getHeight()
  const M = 54
  const CONTENT_W = PAGE_W - M * 2
  let y = M

  const ensureSpace = (need: number) => {
    if (y + need > PAGE_H - M) {
      doc.addPage()
      y = M
    }
  }

  const setColor = (hex: string) => {
    const [r, g, b] = hexRgb(hex)
    doc.setTextColor(r, g, b)
  }

  const drawText = (
    text: string,
    opts: {
      font?: 'helvetica' | 'courier' | 'times'
      style?: 'normal' | 'bold' | 'italic' | 'bolditalic'
      size?: number
      color?: string
      x?: number
      maxW?: number
      lineH?: number
    } = {},
  ) => {
    const font = opts.font ?? 'helvetica'
    const style = opts.style ?? 'normal'
    const size = opts.size ?? 10
    const color = opts.color ?? C.body
    const x = opts.x ?? M
    const maxW = opts.maxW ?? CONTENT_W
    const lineH = opts.lineH ?? 1.35
    doc.setFont(font, style)
    doc.setFontSize(size)
    setColor(color)
    const lines = doc.splitTextToSize(text.trim(), maxW)
    for (const line of lines) {
      const h = size * lineH
      ensureSpace(h)
      doc.text(line, x, y + size)
      y += h
    }
  }

  const drawRule = () => {
    ensureSpace(12)
    doc.setDrawColor(C.rule[0], C.rule[1], C.rule[2])
    doc.setLineWidth(0.8)
    doc.line(M, y + 2, PAGE_W - M, y + 2)
    y += 10
  }

  const gap = (px: number) => {
    y += px
  }

  const section = (title: string) => {
    gap(10)
    drawText(title.toUpperCase(), { font: 'courier', style: 'bold', size: 10, color: C.tag })
    drawRule()
  }

  const bulletPdf = (text: string) => {
    const size = 10
    const lineH = size * 1.35
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    setColor(C.body)
    const lines = doc.splitTextToSize(text, CONTENT_W - 14)
    lines.forEach((line: string, idx: number) => {
      ensureSpace(lineH)
      if (idx === 0) doc.text('•', M, y + size)
      doc.text(line, M + 14, y + size)
      y += lineH
    })
  }

  const rightAlignedDates = (
    leftText: string,
    dates: string,
    opts: { leftSize?: number; rightSize?: number } = {},
  ) => {
    const leftSize = opts.leftSize ?? 12
    const rightSize = opts.rightSize ?? 9
    const lineH = leftSize * 1.4
    ensureSpace(lineH)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(leftSize)
    setColor(C.body)
    doc.text(leftText, M, y + leftSize)

    if (dates.trim()) {
      doc.setFont('courier', 'normal')
      doc.setFontSize(rightSize)
      setColor(C.muted)
      const rightW = doc.getTextWidth(dates)
      doc.text(dates, PAGE_W - M - rightW, y + leftSize)
    }
    y += lineH
  }

  drawText(model.name, { font: 'helvetica', style: 'bold', size: 24, color: C.name })
  gap(2)
  if (model.tagline.trim()) drawText(model.tagline, { font: 'courier', style: 'normal', size: 11, color: C.tag })
  gap(2)
  if (model.contact.trim()) {
    drawText(model.contact, { font: 'courier', style: 'normal', size: 9, color: C.muted })
  }
  gap(4)
  drawRule()

  gap(2)
  if (model.summary.trim()) {
    drawText(model.summary, { font: 'helvetica', style: 'normal', size: 10, color: C.summary })
  }

  const writeSkillRow = (label: string, value: string) => {
    const safeLabel = label.trim()
    const safeValue = value.trim()
    if (!safeLabel && !safeValue) return
    if (!safeLabel) {
      drawText(safeValue, { size: 10, color: C.skill })
      return
    }

    const size = 10
    const lineH = size * 1.4
    ensureSpace(lineH)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(size)
    setColor(C.body)
    const labelText = safeLabel.endsWith(':') ? `${safeLabel} ` : `${safeLabel}: `
    const labelWidth = doc.getTextWidth(labelText)
    doc.text(labelText, M, y + size)
    doc.setFont('helvetica', 'normal')
    setColor(C.skill)
    const valueLines = doc.splitTextToSize(safeValue, CONTENT_W - labelWidth)
    doc.text((valueLines[0] ?? '') as string, M + labelWidth, y + size)
    y += lineH
    for (let i = 1; i < valueLines.length; i += 1) {
      ensureSpace(lineH)
      doc.text((valueLines[i] ?? '') as string, M, y + size)
      y += lineH
    }
    gap(0)
  }

  const jobBlock = (job: JobBlock) => {
    const { company, dates } = splitCompanyAndDates(job.companyLine)
    gap(4)
    rightAlignedDates(company || job.companyLine, dates, { leftSize: 12, rightSize: 9 })
    if (job.role.trim()) {
      drawText(job.role, { font: 'helvetica', style: 'italic', size: 10.5, color: C.tag })
    }
    gap(2)
    for (const b of job.bullets) {
      if (b.trim()) bulletPdf(b)
    }
  }

  const pushSection = (sec: ResumeSection) => {
    if (sec.kind === 'skills') {
      section(sec.title)
      for (const row of sec.rows) {
        writeSkillRow(row.label, row.value)
      }
      return
    }
    if (sec.kind === 'experience') {
      section(sec.title)
      for (const j of sec.jobs) jobBlock(j)
      return
    }
    if (sec.kind === 'education') {
      section(sec.title)
      const [first, ...rest] = sec.lines
      if (first?.trim()) drawText(first.trim(), { font: 'helvetica', style: 'bold', size: 10.5, color: C.body })
      if (rest.length) drawText(rest.join(' · '), { font: 'helvetica', style: 'normal', size: 9.5, color: C.muted })
      return
    }
    if (sec.kind === 'bullets') {
      section(sec.title)
      for (const item of sec.items) {
        if (item.trim()) bulletPdf(item)
      }
      return
    }
    if (sec.kind === 'summary') {
      section(sec.title)
      for (const p of sec.paragraphs) {
        if (p.trim()) drawText(p, { font: 'helvetica', style: 'normal', size: 10, color: C.summary })
      }
      return
    }
    section(sec.title)
    for (const line of sec.lines) {
      if (line.trim()) drawText(line.trim(), { size: 10, color: C.body })
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
