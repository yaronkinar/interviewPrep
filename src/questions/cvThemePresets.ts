/** Visual presets for plain-text CV → canvas PNG preview. */

export type CvThemePresetId =
  | 'editorial'
  | 'noir'
  | 'ocean'
  | 'parchment'
  | 'mono'
  | 'rose'

export type CvThemePreset = {
  id: CvThemePresetId
  background: string
  text: string
  border: string
  accent: string
  /** Top accent stripe height in CSS px; 0 matches the classic analysis preview. */
  accentBarHeight?: number
  fontSizePx: number
  /** CSS font-family stack (size applied separately). */
  fontStack: string
  lineHeight: number
}

export const CV_THEME_PRESETS: readonly CvThemePreset[] = [
  {
    id: 'editorial',
    background: '#f7f6f3',
    text: '#141413',
    border: '#e3e0d8',
    accent: '#2c2c2a',
    accentBarHeight: 0,
    fontSizePx: 15,
    fontStack: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    lineHeight: 24,
  },
  {
    id: 'noir',
    background: '#121418',
    text: '#eceff4',
    border: '#2a3038',
    accent: '#5eead4',
    fontSizePx: 15,
    fontStack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    lineHeight: 24,
  },
  {
    id: 'ocean',
    background: '#eef4f8',
    text: '#0f172a',
    border: '#c7d7e6',
    accent: '#0369a1',
    fontSizePx: 15,
    fontStack: '"Source Serif 4", Georgia, "Times New Roman", serif',
    lineHeight: 26,
  },
  {
    id: 'parchment',
    background: '#faf6ed',
    text: '#3d2e1f',
    border: '#e8dcc4',
    accent: '#a16207',
    fontSizePx: 16,
    fontStack: 'Georgia, "Times New Roman", serif',
    lineHeight: 26,
  },
  {
    id: 'mono',
    background: '#f4f4f5',
    text: '#18181b',
    border: '#d4d4d8',
    accent: '#52525b',
    fontSizePx: 14,
    fontStack: 'ui-monospace, "Cascadia Code", "Segoe UI Mono", Consolas, monospace',
    lineHeight: 22,
  },
  {
    id: 'rose',
    background: '#fff5f7',
    text: '#4a041d',
    border: '#f9c9d6',
    accent: '#be123c',
    fontSizePx: 15,
    fontStack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    lineHeight: 24,
  },
] as const

export function findCvThemePreset(id: CvThemePresetId): CvThemePreset {
  const p = CV_THEME_PRESETS.find((x) => x.id === id)
  return p ?? CV_THEME_PRESETS[0]
}
