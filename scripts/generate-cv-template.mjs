/**
 * Generates public/cv-template.docx — a styled Word starter matching the site résumé layout
 * (Arial + Courier New, blue section rules, right-tab dates). Run after changing styles:
 *   node scripts/generate-cv-template.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BorderStyle, Document, Packer, Paragraph, TextRun, convertInchesToTwip } from 'docx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', 'public', 'cv-template.docx')

const C = {
  name: '0E1C2F',
  tagline: '3B82F6',
  muted: '8DA0B8',
  body: '1A2332',
  summary: '3A4A5C',
  skillMuted: '555F6E',
  rule: '3B82F6',
  hint: '8DA0B8',
}

const FONT = { body: 'Arial', mono: 'Courier New' }
const PT = { name: 52, tag: 18, sec: 18, body: 20, co: 22, role: 19 }

function rule() {
  return new Paragraph({
    spacing: { after: 160 },
    border: {
      bottom: { color: C.rule, style: BorderStyle.SINGLE, size: 6, space: 1 },
    },
    children: [new TextRun({ text: '\u200b', font: FONT.body, size: PT.body })],
  })
}

function secTitle(t) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: t.toUpperCase(),
        font: FONT.mono,
        bold: true,
        size: PT.sec,
        color: C.tagline,
      }),
    ],
  })
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'default-bullet-numbering', level: 0 },
    spacing: { before: 20, after: 20 },
    children: [new TextRun({ text, font: FONT.body, size: PT.body, color: C.body })],
  })
}

const children = [
  new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: 'Interview Prep — replace {{name}}, {{tagline}}, {{contact}}, {{summary}}, and section blocks below, or paste your own content while keeping styles.',
        italics: true,
        font: FONT.body,
        size: 18,
        color: C.hint,
      }),
    ],
  }),

  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: '{{name}}', bold: true, font: FONT.body, size: PT.name, color: C.name })],
  }),
  new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: '{{tagline}}',
        font: FONT.mono,
        size: PT.tag,
        color: C.tagline,
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 0 },
    children: [
      new TextRun({
        text: '{{contact}}',
        font: FONT.mono,
        size: PT.tag,
        color: C.muted,
      }),
    ],
  }),
  rule(),
  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: '{{summary}}', font: FONT.body, size: PT.body, color: C.summary })],
  }),

  secTitle('Skills'),
  rule(),
  new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: '{{skill_label}}: ', bold: true, font: FONT.body, size: PT.body, color: C.body }),
      new TextRun({ text: '{{skill_value}}', font: FONT.body, size: PT.body, color: C.skillMuted }),
    ],
  }),

  secTitle('Work history'),
  rule(),
  new Paragraph({
    rightTabStop: 9360,
    spacing: { before: 200, after: 20 },
    children: [
      new TextRun({ text: '{{company}}', bold: true, font: FONT.body, size: PT.co, color: C.body }),
      new TextRun({
        text: '\t{{dates}}',
        font: FONT.mono,
        size: PT.tag,
        color: C.muted,
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: '{{job_title}}',
        italics: true,
        font: FONT.body,
        size: PT.role,
        color: C.tagline,
      }),
    ],
  }),
  bullet('{{bullet_1}}'),
  bullet('{{bullet_2}}'),
  bullet('{{bullet_3}}'),

  secTitle('Education'),
  rule(),
  new Paragraph({
    spacing: { before: 60, after: 40 },
    children: [
      new TextRun({
        text: '{{degree}}',
        bold: true,
        font: FONT.body,
        size: PT.body,
        color: C.body,
      }),
    ],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({
        text: '{{school_meta}}',
        font: FONT.body,
        size: 19,
        color: C.muted,
      }),
    ],
  }),
]

const doc = new Document({
  creator: 'Interview Prep',
  title: 'Résumé template (Interview Prep)',
  description: 'Blank styled .docx template matching the site export layout.',
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

const buf = await Packer.toBuffer(doc)
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, buf)
console.log('Wrote', outPath)
