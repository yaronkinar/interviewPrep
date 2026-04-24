/**
 * Monaco Editor environment setup for Next.js.
 * Using @monaco-editor/react default CDN loader (no Vite ?worker syntax needed).
 * Call initMonaco() once before rendering any Monaco editor.
 */

let initialized = false

export function initMonaco(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true
  // @monaco-editor/react handles worker loading automatically via CDN
  // No custom worker configuration needed in Next.js
}
