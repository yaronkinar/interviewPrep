/**
 * Generates cleaned-up Yaron Kinar résumé as .docx and .pdf.
 * Applies mechanical fixes from the review (escape chars, typos, filler trimming,
 * pre-2015 consolidation) without inventing any facts.
 *
 * Run:  node scripts/generate-yaron-cv.mjs
 * Out:  C:/Users/yaron/Downloads/Yaron_Kinar_Resume.docx
 *       C:/Users/yaron/Downloads/Yaron_Kinar_Resume.pdf
 */
import { writeFileSync } from 'node:fs'
import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  ExternalHyperlink,
  convertInchesToTwip,
} from 'docx'
import { jsPDF } from 'jspdf'

const OUT_DIR = 'C:/Users/yaron/Downloads'
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
const BASENAME = `Yaron_Kinar_Resume_${stamp}`

const resume = {
  name: 'Yaron Kinar',
  tagline: 'Senior Software Engineer · Frontend',
  contactLines: [
    'Netanya, Israel · 052-335-7076 · yaronkinar@gmail.com',
    'linkedin.com/in/yaronkinar · github.com/yaronkinar · yaronkinar.dev',
  ],
  links: {
    linkedin: 'https://www.linkedin.com/in/yaronkinar/',
    github: 'https://github.com/yaronkinar',
    site: 'https://yaronkinar.dev/',
    email: 'mailto:yaronkinar@gmail.com',
  },
  summary:
    'Senior Frontend Engineer with 10+ years shipping data-heavy web apps in React, Vue 3, and TypeScript. Cut a critical page load from 3 minutes to under 6 seconds (~95%) in a complex, data-intensive system. Comfortable across the stack with .NET, Java/Spring, and Node.js, with a bias for measurable performance wins and long-term code health.',
  skills: [
    { label: 'Frontend', value: 'React, Vue 3, TypeScript, JavaScript (ES6+), HTML5, CSS3, SCSS' },
    { label: 'Backend', value: '.NET (C#), Java (Spring), Node.js' },
    { label: 'Testing', value: 'Playwright, Selenium, NUnit' },
    { label: 'Tooling & DevOps', value: 'Docker, Jenkins, Azure DevOps, Webpack' },
    { label: 'Focus areas', value: 'Performance optimization, frontend architecture, scalable UI systems' },
  ],
  jobs: [
    {
      company: 'Tipalti',
      location: 'Israel',
      dates: '2024 – 2026',
      role: 'Software Engineer — Frontend Oriented',
      bullets: [
        'Architected and led development of scalable client-side applications using Vue 3, Composition API, and TypeScript.',
        'Reduced page load time by ~95% (from 3 minutes to under 6 seconds) by optimizing rendering flows and data handling in a complex UI.',
        'Developed and maintained server-side logic and RESTful APIs using .NET (C#).',
        'Built reusable UI component libraries to ensure consistency across the platform.',
        'Delivered end-to-end features impacting core product flows.',
        'Winner of the Tipalti 2025 Hackathon.',
      ],
    },
    {
      company: 'Informatica',
      location: 'Israel',
      dates: '2015 – 2023',
      role: 'Senior Software Engineer — Frontend Oriented',
      bullets: [
        'Led frontend development of a cloud-based SPA using React.',
        'Maintained and evolved legacy AngularJS components as part of a system migration.',
        'Built complex, data-intensive UI systems with a strong emphasis on performance and scalability.',
        'Developed backend services using Java (Spring MVC).',
        'Implemented automated testing strategies (unit + E2E) to ensure high-quality releases.',
      ],
    },
    {
      company: 'Cyber-seal',
      location: 'Israel',
      dates: '2014 – 2015',
      role: 'Web Developer',
      bullets: [
        'Developed a web application for a secured network switch and related network devices.',
        'Stack: AngularJS, jQuery, CSS3, SCSS, Bootstrap, HTML5, Node.js (Grunt), Bower, Protractor.',
      ],
    },
  ],
  projects: [
    {
      name: 'Interview Prep',
      links: [
        { url: 'https://jsinterviewprep.xyz/', label: 'jsinterviewprep.xyz' },
        { url: 'https://github.com/yaronkinar/interviewPrep', label: 'github.com/yaronkinar/interviewPrep' },
      ],
      desc: 'Web app for practicing frontend interview questions with an AI-assisted CV analyzer, theme generator, and DOCX/PDF export.',
      tech: 'React 19 · TypeScript · Vite · Tailwind CSS · shadcn/Radix UI · Anthropic, OpenAI & Google Gemini SDKs · docx, jsPDF, pdf.js, mammoth · Vercel',
    },
    {
      name: 'Pantry — Smart Grocery Lists',
      links: [
        { url: 'https://pentryapp.com/', label: 'pentryapp.com' },
        { url: 'https://github.com/yaronkinar/grocery-app', label: 'github.com/yaronkinar/grocery-app' },
      ],
      desc: 'Grocery-list and pantry-tracking app with an AI chatbot and semantic search. Monorepo with separate web and mobile apps sharing a Supabase backend.',
      tech: 'React (web) · React Native (mobile) · TypeScript · Vite · Supabase (Postgres, Auth, Storage, pgvector) · Anthropic Claude · Voyage AI embeddings (voyage-3.5-lite)',
    },
  ],
  earlier: [
    { co: 'Leverate', dates: '2013 – 2014', desc: 'High-volume trading platforms (web/mobile) with Ext.js, jQuery, ASP.NET MVC 4 (C#); TDD/BDD with NUnit, Selenium, SpecFlow; CI with TeamCity.' },
    { co: 'Supportspace', dates: '2011 – 2013', desc: 'Technical-support platforms built on Java (J2EE, Spring), Groovy on Grails, jQuery, and prototype.js.' },
    { co: 'Edge BI', dates: '2010 – 2011', desc: 'AJAX web applications and dashboards (PHP, HTML, jQuery); maintained company WordPress site.' },
  ],
  education: {
    degree: 'B.A. Business Management and Information Systems',
    school: 'Ruppin Academic Center, Emek Hefer',
    year: '2008',
  },
  accomplishments: [
    'Won the 2025 Tipalti Hackathon.',
    'Proven ability to optimize performance in complex, data-heavy applications.',
    'Strong experience with semantic HTML and structured UI supporting accessibility best practices.',
  ],
}

/* -------------------------- DOCX -------------------------- */

const FONT = { body: 'Arial', mono: 'Courier New' }
const C = {
  name: '0A1628',
  accent: '1D4ED8',
  muted: '4A5866',
  body: '111827',
  summary: '2A3440',
  skillMuted: '3F4855',
}
const PT = { name: 52, tag: 20, contact: 18, sec: 18, body: 20, co: 22, role: 19, small: 18 }

function hr() {
  return new Paragraph({
    spacing: { after: 160 },
    border: { bottom: { color: C.accent, style: BorderStyle.SINGLE, size: 6, space: 1 } },
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
        color: C.accent,
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

function jobHeader(job) {
  return [
    new Paragraph({
      tabStops: [{ type: 'right', position: 9360 }],
      spacing: { before: 200, after: 20 },
      children: [
        new TextRun({ text: `${job.company} · ${job.location}`, bold: true, font: FONT.body, size: PT.co, color: C.body }),
        new TextRun({ text: `\t${job.dates}`, font: FONT.mono, size: PT.tag, color: C.muted }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: job.role, italics: true, font: FONT.body, size: PT.role, color: C.accent }),
      ],
    }),
  ]
}

const docChildren = [
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: resume.name, bold: true, font: FONT.body, size: PT.name, color: C.name })],
  }),
  new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: resume.tagline, font: FONT.mono, size: PT.tag, color: C.accent })],
  }),
  ...resume.contactLines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text: line, font: FONT.mono, size: PT.contact, color: C.muted })],
      }),
  ),
  hr(),

  new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: resume.summary, font: FONT.body, size: PT.body, color: C.summary })],
  }),

  secTitle('Skills'),
  hr(),
  ...resume.skills.map(
    (s) =>
      new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: `${s.label}: `, bold: true, font: FONT.body, size: PT.body, color: C.body }),
          new TextRun({ text: s.value, font: FONT.body, size: PT.body, color: C.skillMuted }),
        ],
      }),
  ),

  secTitle('Work history'),
  hr(),
  ...resume.jobs.flatMap((job) => [...jobHeader(job), ...job.bullets.map(bullet)]),

  secTitle('Personal projects'),
  hr(),
  ...resume.projects.flatMap((p) => {
    const linkChildren = []
    p.links.forEach((l, idx) => {
      if (idx > 0) {
        linkChildren.push(new TextRun({ text: '  ·  ', font: FONT.mono, size: PT.small, color: C.muted }))
      }
      linkChildren.push(
        new ExternalHyperlink({
          link: l.url,
          children: [
            new TextRun({ text: l.label, font: FONT.mono, size: PT.small, color: C.accent, underline: {} }),
          ],
        }),
      )
    })
    return [
      new Paragraph({
        spacing: { before: 140, after: 20 },
        children: [new TextRun({ text: p.name, bold: true, font: FONT.body, size: PT.body, color: C.body })],
      }),
      new Paragraph({
        spacing: { after: 20 },
        children: linkChildren,
      }),
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: p.desc, font: FONT.body, size: PT.body, color: C.summary })],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'Tech: ', bold: true, font: FONT.body, size: PT.small, color: C.body }),
          new TextRun({ text: p.tech, font: FONT.body, size: PT.small, color: C.skillMuted }),
        ],
      }),
    ]
  }),

  secTitle('Earlier experience'),
  hr(),
  ...resume.earlier.map(
    (e) =>
      new Paragraph({
        spacing: { before: 60, after: 60 },
        tabStops: [{ type: 'right', position: 9360 }],
        children: [
          new TextRun({ text: `${e.co}`, bold: true, font: FONT.body, size: PT.body, color: C.body }),
          new TextRun({ text: `\t${e.dates}`, font: FONT.mono, size: PT.small, color: C.muted }),
          new TextRun({ text: `\n${e.desc}`, font: FONT.body, size: PT.body, color: C.summary, break: 1 }),
        ],
      }),
  ),

  secTitle('Education'),
  hr(),
  new Paragraph({
    spacing: { before: 60, after: 40 },
    children: [new TextRun({ text: resume.education.degree, bold: true, font: FONT.body, size: PT.body, color: C.body })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({
        text: `${resume.education.school} · ${resume.education.year}`,
        font: FONT.body,
        size: PT.small,
        color: C.muted,
      }),
    ],
  }),
]

const doc = new Document({
  creator: 'Yaron Kinar',
  title: 'Yaron Kinar — Résumé',
  description: 'Senior Software Engineer · Frontend',
  numbering: {
    config: [
      {
        reference: 'default-bullet-numbering',
        levels: [
          {
            level: 0,
            format: 'bullet',
            text: '•',
            alignment: 'left',
            style: {
              paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.2) } },
            },
          },
        ],
      },
    ],
  },
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
      children: docChildren,
    },
  ],
})

const docxBuf = await Packer.toBuffer(doc)
const docxPath = `${OUT_DIR}/${BASENAME}.docx`
writeFileSync(docxPath, docxBuf)
console.log('Wrote', docxPath)

/* -------------------------- PDF -------------------------- */

const pdf = new jsPDF({ unit: 'pt', format: 'letter' })
const PAGE_W = pdf.internal.pageSize.getWidth()
const PAGE_H = pdf.internal.pageSize.getHeight()
const MARGIN = 54
const CONTENT_W = PAGE_W - MARGIN * 2
let y = MARGIN

function ensureSpace(h) {
  if (y + h > PAGE_H - MARGIN) {
    pdf.addPage()
    y = MARGIN
  }
}

function setColor(hex) {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  pdf.setTextColor(r, g, b)
}

function drawText(text, { font = 'helvetica', style = 'normal', size = 10, color = C.body, x = MARGIN, maxW = CONTENT_W, lineH = 1.35 } = {}) {
  pdf.setFont(font, style)
  pdf.setFontSize(size)
  setColor(color)
  const lines = pdf.splitTextToSize(text, maxW)
  for (const line of lines) {
    const h = size * lineH
    ensureSpace(h)
    pdf.text(line, x, y + size)
    y += h
  }
}

function drawRule() {
  ensureSpace(12)
  const r = parseInt(C.accent.slice(0, 2), 16)
  const g = parseInt(C.accent.slice(2, 4), 16)
  const b = parseInt(C.accent.slice(4, 6), 16)
  pdf.setDrawColor(r, g, b)
  pdf.setLineWidth(0.8)
  pdf.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2)
  y += 10
}

function gap(px) { y += px }

function section(title) {
  gap(10)
  drawText(title.toUpperCase(), { font: 'courier', style: 'bold', size: 10, color: C.accent })
  drawRule()
}

function bulletPdf(text) {
  const size = 10
  const lineH = size * 1.35
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(size)
  setColor(C.body)
  const lines = pdf.splitTextToSize(text, CONTENT_W - 14)
  lines.forEach((line, idx) => {
    ensureSpace(lineH)
    if (idx === 0) pdf.text('•', MARGIN, y + size)
    pdf.text(line, MARGIN + 14, y + size)
    y += lineH
  })
}

function rightAlignedDates(leftText, dates, { leftFont = 'helvetica', leftStyle = 'bold', leftSize = 12, leftColor = C.body, rightColor = C.muted, rightSize = 9 } = {}) {
  const lineH = leftSize * 1.4
  ensureSpace(lineH)
  pdf.setFont(leftFont, leftStyle)
  pdf.setFontSize(leftSize)
  setColor(leftColor)
  pdf.text(leftText, MARGIN, y + leftSize)

  pdf.setFont('courier', 'normal')
  pdf.setFontSize(rightSize)
  setColor(rightColor)
  const rightW = pdf.getTextWidth(dates)
  pdf.text(dates, PAGE_W - MARGIN - rightW, y + leftSize)
  y += lineH
}

drawText(resume.name, { font: 'helvetica', style: 'bold', size: 24, color: C.name })
gap(2)
drawText(resume.tagline, { font: 'courier', style: 'normal', size: 11, color: C.accent })
gap(2)
for (const line of resume.contactLines) {
  drawText(line, { font: 'courier', style: 'normal', size: 9, color: C.muted })
}
gap(4)
drawRule()

gap(2)
drawText(resume.summary, { font: 'helvetica', style: 'normal', size: 10, color: C.summary })

section('Skills')
for (const s of resume.skills) {
  const size = 10
  const lineH = size * 1.4
  ensureSpace(lineH)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(size)
  setColor(C.body)
  const labelText = `${s.label}: `
  pdf.text(labelText, MARGIN, y + size)
  const labelW = pdf.getTextWidth(labelText)

  pdf.setFont('helvetica', 'normal')
  setColor(C.skillMuted)
  const valLines = pdf.splitTextToSize(s.value, CONTENT_W - labelW)
  valLines.forEach((line, idx) => {
    if (idx === 0) {
      pdf.text(line, MARGIN + labelW, y + size)
      y += lineH
    } else {
      ensureSpace(lineH)
      pdf.text(line, MARGIN, y + size)
      y += lineH
    }
  })
}

section('Work history')
for (const job of resume.jobs) {
  gap(4)
  rightAlignedDates(`${job.company} · ${job.location}`, job.dates, { leftSize: 12 })
  drawText(job.role, { font: 'helvetica', style: 'italic', size: 10.5, color: C.accent })
  gap(2)
  for (const b of job.bullets) bulletPdf(b)
}

section('Personal projects')
const accentRGB = {
  r: parseInt(C.accent.slice(0, 2), 16),
  g: parseInt(C.accent.slice(2, 4), 16),
  b: parseInt(C.accent.slice(4, 6), 16),
}
for (const p of resume.projects) {
  gap(4)

  const titleSize = 11
  const titleLineH = titleSize * 1.4
  ensureSpace(titleLineH)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(titleSize)
  setColor(C.body)
  pdf.text(p.name, MARGIN, y + titleSize)
  y += titleLineH

  const linkSize = 9
  const linkLineH = linkSize * 1.45
  ensureSpace(linkLineH)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(linkSize)
  setColor(C.accent)
  pdf.setDrawColor(accentRGB.r, accentRGB.g, accentRGB.b)
  pdf.setLineWidth(0.4)
  let linkX = MARGIN
  p.links.forEach((l, idx) => {
    if (idx > 0) {
      pdf.setFont('courier', 'normal')
      setColor(C.muted)
      const sep = '  ·  '
      pdf.text(sep, linkX, y + linkSize)
      linkX += pdf.getTextWidth(sep)
      setColor(C.accent)
    }
    const w = pdf.getTextWidth(l.label)
    pdf.textWithLink(l.label, linkX, y + linkSize, { url: l.url })
    pdf.line(linkX, y + linkSize + 1.5, linkX + w, y + linkSize + 1.5)
    linkX += w
  })
  y += linkLineH

  drawText(p.desc, { font: 'helvetica', style: 'normal', size: 10, color: C.summary })

  const techSize = 9
  const techLineH = techSize * 1.4
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(techSize)
  setColor(C.body)
  ensureSpace(techLineH)
  const techLabel = 'Tech: '
  pdf.text(techLabel, MARGIN, y + techSize)
  const techLabelW = pdf.getTextWidth(techLabel)

  pdf.setFont('helvetica', 'normal')
  setColor(C.skillMuted)
  const techLines = pdf.splitTextToSize(p.tech, CONTENT_W - techLabelW)
  techLines.forEach((line, idx) => {
    if (idx === 0) {
      pdf.text(line, MARGIN + techLabelW, y + techSize)
      y += techLineH
    } else {
      ensureSpace(techLineH)
      pdf.text(line, MARGIN, y + techSize)
      y += techLineH
    }
  })
}

section('Earlier experience')
for (const e of resume.earlier) {
  gap(2)
  rightAlignedDates(e.co, e.dates, { leftSize: 10.5 })
  drawText(e.desc, { font: 'helvetica', style: 'normal', size: 10, color: C.summary })
}

section('Education')
drawText(resume.education.degree, { font: 'helvetica', style: 'bold', size: 10.5, color: C.body })
drawText(`${resume.education.school} · ${resume.education.year}`, { font: 'helvetica', style: 'normal', size: 9.5, color: C.muted })

const pdfPath = `${OUT_DIR}/${BASENAME}.pdf`
writeFileSync(pdfPath, Buffer.from(pdf.output('arraybuffer')))
console.log('Wrote', pdfPath)
