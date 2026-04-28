/** Shared deterministic badge style for dynamically discovered companies (browser + server). */

function hslToHex(h: number, sPercent: number, lPercent: number): string {
  const s = sPercent / 100
  const l = lPercent / 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  }
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

export function deterministicCompanyBadgeStyle(id: string): { emoji: string; color: string } {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  const hue = Math.abs(h) % 360
  return { emoji: '🏢', color: hslToHex(hue, 55, 42) }
}
