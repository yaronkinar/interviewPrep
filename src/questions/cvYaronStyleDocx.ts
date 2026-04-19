/**
 * Build a .docx that visually matches the “Yaron_Kinar_Resume.docx” template:
 * Arial body, Courier section labels, blue (#3B82F6) accents and rules, muted meta (#8DA0B8).
 */

import { BorderStyle, Document, Packer, Paragraph, TextRun, convertInchesToTwip } from 'docx'
import {
  parseCvPlainTextToResumeModel,
  resumeFileBaseName,
  type JobBlock,
  type ResumeModel,
  type ResumeSection,
} from './cvYaronResumeModel'

const C = {
  name: '0E1C2F',
  tagline: '3B82F6',
  link: '3B82F6',
  muted: '8DA0B8',
  body: '1A2332',
  summary: '3A4A5C',
  skillMuted: '555F6E',
  rule: '3B82F6',
} as const

const FONT = { body: 'Arial', mono: 'Courier New' } as const

const HALF_PT = {
  name: 52,
  tagline: 18,
  section: 18,
  body: 20,
  company: 22,
  role: 19,
  eduMeta: 19,
} as const

const DATE_IN_LINE =
  /\d{2}\/\d{4}|\b20\d{2}\s*[–—-]\s*(?:20\d{2}|Present|Current)\b|\b20\d{2}\s*-\s*(?:20\d{2}|Present|Current)\b/i

function sectionRuleParagraph(): Paragraph {
  return new Paragraph({
    spacing: { after: 160 },
    border: {
      bottom: { color: C.rule, style: BorderStyle.SINGLE, size: 6, space: 1 },
    },
    children: [new TextRun({ text: '\u200b', font: FONT.body, size: HALF_PT.body })],
  })
}

function sectionTitleParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        font: FONT.mono,
        bold: true,
        size: HALF_PT.section,
        color: C.tagline,
      }),
    ],
  })
}

function contactRuns(text: string): TextRun[] {
  if (!text.trim()) {
    return [new TextRun({ text: '\u00a0', font: FONT.mono, size: HALF_PT.tagline, color: C.muted })]
  }
  const runs: TextRun[] = []
  const parts = text.split(/(\s+)/)
  for (const p of parts) {
    if (!p) continue
    if (/^\s+$/.test(p)) {
      runs.push(new TextRun({ text: p, font: FONT.mono, size: HALF_PT.tagline }))
      continue
    }
    const blue = /@|https?:\/\//i.test(p) || /\.(com|dev|io|net|org|co\.il)\b/i.test(p)
    runs.push(
      new TextRun({
        text: p,
        font: FONT.mono,
        size: HALF_PT.tagline,
        color: blue ? C.link : C.muted,
      }),
    )
  }
  return runs
}

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

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'default-bullet-numbering', level: 0 },
    spacing: { before: 20, after: 20 },
    children: [new TextRun({ text, font: FONT.body, size: HALF_PT.body, color: C.body })],
  })
}

function jobBlockParagraphs(job: JobBlock): Paragraph[] {
  const out: Paragraph[] = []
  const { company, dates } = splitCompanyAndDates(job.companyLine)
  out.push(
    new Paragraph({
      rightTabStop: 9360,
      spacing: { before: 200, after: 20 },
      children: [
        new TextRun({
          text: company || job.companyLine,
          bold: true,
          font: FONT.body,
          size: HALF_PT.company,
          color: C.body,
        }),
        new TextRun({
          text: dates ? `\t${dates}` : '\t',
          font: FONT.mono,
          size: HALF_PT.tagline,
          color: C.muted,
        }),
      ],
    }),
  )

  if (job.role.trim()) {
    out.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: job.role,
            font: FONT.body,
            italics: true,
            size: HALF_PT.role,
            color: C.tagline,
          }),
        ],
      }),
    )
  }
  for (const b of job.bullets) {
    if (b.trim()) out.push(bulletParagraph(b.trim()))
  }
  return out
}

function pushSection(children: Paragraph[], sec: ResumeSection): void {
  if (sec.kind === 'summary') {
    children.push(sectionTitleParagraph(sec.title))
    children.push(sectionRuleParagraph())
    for (const p of sec.paragraphs) {
      if (!p.trim()) continue
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: p, font: FONT.body, size: HALF_PT.body, color: C.summary })],
        }),
      )
    }
    return
  }

  if (sec.kind === 'skills') {
    children.push(sectionTitleParagraph(sec.title))
    children.push(sectionRuleParagraph())
    for (const row of sec.rows) {
      if (row.label) {
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: row.label, bold: true, font: FONT.body, size: HALF_PT.body, color: C.body }),
              new TextRun({ text: ` ${row.value}`, font: FONT.body, size: HALF_PT.body, color: C.skillMuted }),
            ],
          }),
        )
      } else {
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: row.value, font: FONT.body, size: HALF_PT.body, color: C.body })],
          }),
        )
      }
    }
    return
  }

  if (sec.kind === 'experience') {
    children.push(sectionTitleParagraph(sec.title))
    children.push(sectionRuleParagraph())
    for (const job of sec.jobs) {
      children.push(...jobBlockParagraphs(job))
    }
    return
  }

  if (sec.kind === 'education') {
    children.push(sectionTitleParagraph(sec.title))
    children.push(sectionRuleParagraph())
    const [first, ...rest] = sec.lines
    if (first?.trim()) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [new TextRun({ text: first.trim(), bold: true, font: FONT.body, size: HALF_PT.body, color: C.body })],
        }),
      )
    }
    if (rest.length) {
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({
              text: rest.join(' · '),
              font: FONT.body,
              size: HALF_PT.eduMeta,
              color: C.muted,
            }),
          ],
        }),
      )
    }
    return
  }

  if (sec.kind === 'bullets') {
    children.push(sectionTitleParagraph(sec.title))
    children.push(sectionRuleParagraph())
    for (const item of sec.items) {
      if (item.trim()) children.push(bulletParagraph(item.trim()))
    }
    return
  }

  children.push(sectionTitleParagraph(sec.title))
  children.push(sectionRuleParagraph())
  for (const line of sec.lines) {
    if (!line.trim()) continue
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: line.trim(), font: FONT.body, size: HALF_PT.body, color: C.body })],
      }),
    )
  }
}

function buildDocument(model: ResumeModel): Document {
  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: model.name,
          bold: true,
          font: FONT.body,
          size: HALF_PT.name,
          color: C.name,
        }),
      ],
    }),
  )

  if (model.tagline.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: model.tagline.toUpperCase(),
            font: FONT.mono,
            size: HALF_PT.tagline,
            color: C.tagline,
          }),
        ],
      }),
    )
  }

  if (model.contact.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 0 },
        children: contactRuns(model.contact),
      }),
    )
  }

  children.push(sectionRuleParagraph())

  if (model.summary.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: model.summary,
            font: FONT.body,
            size: HALF_PT.body,
            color: C.summary,
          }),
        ],
      }),
    )
  }

  for (const sec of model.sections) {
    pushSection(children, sec)
  }

  return new Document({
    creator: 'Interview Prep',
    title: `${model.name} — Résumé`,
    description: 'Generated from plain text to match the site’s default résumé styling.',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children,
      },
    ],
  })
}

/** @returns null when model.name is empty (caller should trim source text first). */
export async function resumeModelToDocxBlob(model: ResumeModel): Promise<Blob | null> {
  if (!model.name.trim()) return null
  const doc = buildDocument(model)
  return Packer.toBlob(doc)
}

/** Parse plain text and build a Word file styled like the reference résumé layout. */
export async function plainTextToYaronStyleDocx(
  raw: string,
): Promise<{ blob: Blob; baseName: string } | null> {
  const text = raw.trim()
  if (!text) return null
  const model = parseCvPlainTextToResumeModel(text)
  const blob = await resumeModelToDocxBlob(model)
  if (!blob) return null
  return { blob, baseName: resumeFileBaseName(model) }
}
