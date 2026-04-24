import mammoth from 'mammoth'
import type { PDFPageProxy } from 'pdfjs-dist'
import { getDocument, GlobalWorkerOptions, version as pdfjsVersion } from 'pdfjs-dist'

const MAX_CV_FILE_BYTES = 12 * 1024 * 1024

let pdfWorkerReady = false

function ensurePdfWorker(): void {
  if (pdfWorkerReady) return
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`
  pdfWorkerReady = true
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim()
}

function isPdf(file: File): boolean {
  const n = normalizeName(file.name)
  return n.endsWith('.pdf') || file.type === 'application/pdf'
}

function isDocx(file: File): boolean {
  const n = normalizeName(file.name)
  return (
    n.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}

function isLegacyDoc(file: File): boolean {
  const n = normalizeName(file.name)
  return (n.endsWith('.doc') && !n.endsWith('.docx')) || file.type === 'application/msword'
}

const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
])

function isRasterImage(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true
  const n = normalizeName(file.name)
  return /\.(png|jpe?g|webp|gif)$/i.test(n)
}

async function renderPdfPageToDataUrl(page: PDFPageProxy, maxCssWidthPx: number): Promise<string | null> {
  if (typeof document === 'undefined') return null
  const base = page.getViewport({ scale: 1 })
  const scale = Math.min(2.25, maxCssWidthPx / base.width)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  const w = Math.max(1, Math.floor(viewport.width))
  const h = Math.max(1, Math.floor(viewport.height))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return null
  const task = page.render({ canvasContext: ctx, viewport, canvas })
  await task.promise
  return canvas.toDataURL('image/png', 0.9)
}

async function extractFromPdf(arrayBuffer: ArrayBuffer): Promise<{ text: string; pdfPreviewDataUrl: string | null }> {
  ensurePdfWorker()
  const data = new Uint8Array(arrayBuffer)
  const loadingTask = getDocument({ data })
  const pdf = await loadingTask.promise
  try {
    const parts: string[] = []
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p)
      const textContent = await page.getTextContent()
      const line = textContent.items
        .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
        .join(' ')
      parts.push(line)
    }
    const text = parts.join('\n\n').replace(/\s+\n/g, '\n').trim()
    let pdfPreviewDataUrl: string | null = null
    try {
      const first = await pdf.getPage(1)
      pdfPreviewDataUrl = await renderPdfPageToDataUrl(first, 720)
    } catch {
      pdfPreviewDataUrl = null
    }
    return { text, pdfPreviewDataUrl }
  } finally {
    await pdf.destroy().catch(() => {})
  }
}

async function textFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer })
  return (result.value ?? '').trim()
}

export type ExtractCvFileOk = {
  ok: true
  text: string
  pdfPreviewDataUrl: string | null
  /** Revoke with URL.revokeObjectURL when replaced or cleared. */
  imageObjectUrl: string | null
}
export type ExtractCvFileErr = { ok: false; code: 'too_large' | 'unsupported' | 'empty' | 'read_error' }

export async function extractCvFileText(file: File): Promise<ExtractCvFileOk | ExtractCvFileErr> {
  if (file.size > MAX_CV_FILE_BYTES) {
    return { ok: false, code: 'too_large' }
  }
  if (isLegacyDoc(file)) {
    return { ok: false, code: 'unsupported' }
  }

  if (isRasterImage(file)) {
    try {
      return {
        ok: true,
        text: '',
        pdfPreviewDataUrl: null,
        imageObjectUrl: URL.createObjectURL(file),
      }
    } catch {
      return { ok: false, code: 'read_error' }
    }
  }

  if (!isPdf(file) && !isDocx(file)) {
    return { ok: false, code: 'unsupported' }
  }

  let arrayBuffer: ArrayBuffer
  try {
    arrayBuffer = await file.arrayBuffer()
  } catch {
    return { ok: false, code: 'read_error' }
  }

  try {
    if (isPdf(file)) {
      const { text, pdfPreviewDataUrl } = await extractFromPdf(arrayBuffer)
      if (!text.trim()) {
        return { ok: false, code: 'empty' }
      }
      return { ok: true, text, pdfPreviewDataUrl, imageObjectUrl: null }
    }
    const text = await textFromDocx(arrayBuffer)
    if (!text.trim()) {
      return { ok: false, code: 'empty' }
    }
    return { ok: true, text, pdfPreviewDataUrl: null, imageObjectUrl: null }
  } catch {
    return { ok: false, code: 'read_error' }
  }
}
