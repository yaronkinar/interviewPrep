/** Appends a fixed English instruction so the model matches the user's UI locale (BCP-47). */
export function appendLocaleToSystemPrompt(system: string, locale?: string): string {
  const code = locale?.trim()
  if (!code) return system
  let label = code
  try {
    const base = code.split('-')[0] ?? code
    label = new Intl.DisplayNames([code], { type: 'language' }).of(base) ?? code
  } catch {
    /* keep code */
  }
  return `${system}\n\n[User interface language: ${label} (locale: ${code}). Write assistant replies in this language unless the user writes in another language—then match the user's language.]`
}
