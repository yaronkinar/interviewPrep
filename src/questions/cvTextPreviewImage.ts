/** Rasterize plain CV text into a PNG data URL (browser only). */

import type { CvThemePreset } from './cvThemePresets'

const DEFAULT_CSS_WIDTH = 720
const DEFAULT_PAD = 40
const DEFAULT_LINE_HEIGHT = 24
const DEFAULT_FONT_PX = 15
const DEFAULT_FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'
const DEFAULT_BACKGROUND = '#f7f6f3'
const DEFAULT_TEXT = '#141413'
const DEFAULT_BORDER = '#e3e0d8'
const DEFAULT_ACCENT_HEIGHT = 4

const MAX_INPUT_CHARS = 28_000
const MAX_LINES = 240

export type CvPlainTextCanvasStyle = {
  cssWidth: number
  pad: number
  lineHeight: number
  fontSizePx: number
  fontStack: string
  background: string
  text: string
  border: string
  accent: string
  accentBarHeight: number
}

export function canvasStyleFromPreset(preset: CvThemePreset): CvPlainTextCanvasStyle {
  return {
    cssWidth: DEFAULT_CSS_WIDTH,
    pad: DEFAULT_PAD,
    lineHeight: preset.lineHeight,
    fontSizePx: preset.fontSizePx,
    fontStack: preset.fontStack,
    background: preset.background,
    text: preset.text,
    border: preset.border,
    accent: preset.accent,
    accentBarHeight: preset.accentBarHeight ?? DEFAULT_ACCENT_HEIGHT,
  }
}

const DEFAULT_STYLE: CvPlainTextCanvasStyle = {
  cssWidth: DEFAULT_CSS_WIDTH,
  pad: DEFAULT_PAD,
  lineHeight: DEFAULT_LINE_HEIGHT,
  fontSizePx: DEFAULT_FONT_PX,
  fontStack: DEFAULT_FONT_STACK,
  background: DEFAULT_BACKGROUND,
  text: DEFAULT_TEXT,
  border: DEFAULT_BORDER,
  accent: '#2c2c2a',
  accentBarHeight: 0,
}

function breakLongToken(ctx: CanvasRenderingContext2D, token: string, maxW: number): string[] {
  const out: string[] = []
  let buf = ''
  for (const ch of token) {
    const t = buf + ch
    if (ctx.measureText(t).width > maxW && buf) {
      out.push(buf)
      buf = ch
    } else {
      buf = t
    }
  }
  if (buf) out.push(buf)
  return out.length ? out : [token.slice(0, 1)]
}

function wrapParagraph(ctx: CanvasRenderingContext2D, para: string, maxW: number): string[] {
  const words = para.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    if (ctx.measureText(w).width > maxW) {
      if (cur) {
        lines.push(cur)
        cur = ''
      }
      lines.push(...breakLongToken(ctx, w, maxW))
      continue
    }
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width <= maxW) {
      cur = test
    } else {
      if (cur) lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines.length ? lines : ['']
}

/**
 * Returns a PNG data URL, or null if empty or not in a browser.
 * @param style Optional canvas colors and typography (defaults match the original editorial preview).
 */
export function renderCvPlainTextToDataUrl(
  raw: string,
  style: CvPlainTextCanvasStyle = DEFAULT_STYLE,
): string | null {
  if (typeof document === 'undefined') return null
  const normalized = raw.replace(/\r\n/g, '\n')
  const trimmed = normalized.trim()
  if (!trimmed) return null

  let slice =
    normalized.length > MAX_INPUT_CHARS
      ? `${normalized.slice(0, MAX_INPUT_CHARS)}\n\n…`
      : normalized

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { cssWidth, pad, lineHeight, fontSizePx, fontStack, background, text, border, accent, accentBarHeight } =
    style
  const fontCss = `${fontSizePx}px ${fontStack}`
  const innerW = cssWidth - pad * 2
  ctx.font = fontCss

  const allLines: string[] = []
  for (const para of slice.split('\n')) {
    if (allLines.length >= MAX_LINES) {
      allLines.push('…')
      break
    }
    if (para === '') {
      allLines.push('')
      continue
    }
    for (const wl of wrapParagraph(ctx, para, innerW)) {
      if (allLines.length >= MAX_LINES) {
        allLines.push('…')
        break
      }
      allLines.push(wl)
    }
  }

  const topPad = pad + accentBarHeight
  const cssH = Math.max(200, topPad + pad + allLines.length * lineHeight + 24)

  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
  canvas.width = Math.max(1, Math.floor(cssWidth * dpr))
  canvas.height = Math.max(1, Math.floor(cssH * dpr))
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  ctx.fillStyle = background
  ctx.fillRect(0, 0, cssWidth, cssH)
  if (accentBarHeight > 0) {
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, cssWidth, accentBarHeight)
  }
  ctx.strokeStyle = border
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, cssWidth - 1, cssH - 1)

  ctx.fillStyle = text
  ctx.font = fontCss
  ctx.textBaseline = 'top'

  let y = topPad
  for (const line of allLines) {
    ctx.fillText(line, pad, y)
    y += lineHeight
  }

  try {
    return canvas.toDataURL('image/png', 0.92)
  } catch {
    return null
  }
}
