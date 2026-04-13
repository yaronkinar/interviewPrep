import mammoth from 'mammoth'
import type { PDFPageProxy } from 'pdfjs-dist'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

const MAX_CV_FILE_BYTES = 12 * 1024 * 1024

let pdfWorkerReady = false

function ensurePdfWorker(): void {
  if (pdfWorkerReady) return
  GlobalWorkerOptions.workerSrc = pdfWorkerSrc
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
    let pdfPreviewDataUrl: string | null = null
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p)
      if (p === 1) {
        pdfPreviewDataUrl = await renderPdfPageToDataUrl(page, 720).catch(() => null)
      }
      const textContent = await page.getTextContent()
      const line = textContent.items
        .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
        .join(' ')
      parts.push(line)
    }
    const text = parts.join('\n\n').replace(/\s+\n/g, '\n').trim()
    return { text, pdfPreviewDataUrl }
  } finally {
    await pdf.destroy().catch(() => {})
  }
}

async function textFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer })
  return (result.value ?? '').trim()
}

export type ExtractCvFileOk = { ok: true; text: string; pdfPreviewDataUrl: string | null }
export type ExtractCvFileErr = { ok: false; code: 'too_large' | 'unsupported' | 'empty' | 'read_error' }

export async function extractCvFileText(file: File): Promise<ExtractCvFileOk | ExtractCvFileErr> {
  if (file.size > MAX_CV_FILE_BYTES) {
    return { ok: false, code: 'too_large' }
  }
  if (isLegacyDoc(file)) {
    return { ok: false, code: 'unsupported' }
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
      return { ok: true, text, pdfPreviewDataUrl }
    }
    const text = await textFromDocx(arrayBuffer)
    if (!text.trim()) {
      return { ok: false, code: 'empty' }
    }
    return { ok: true, text, pdfPreviewDataUrl: null }
  } catch {
    return { ok: false, code: 'read_error' }
  }
}
