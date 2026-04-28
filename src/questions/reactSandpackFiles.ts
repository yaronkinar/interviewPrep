import type { SandpackFiles } from '@codesandbox/sandpack-react'

import { stripModuleSyntax } from './compileReactPreview'

const REACT_HOOKS_IMPORT = `import { useState, useEffect, useMemo, useCallback, useRef, useId, Fragment } from 'react'
`

export const APP_WRAPPER = `import * as U from './UserPreview'

const Cmp = U.App ?? U.Preview ?? U.Demo

export default function App() {
  if (!Cmp) {
    return (
      <pre style={{ color: '#f87171', padding: 12, fontSize: 13, margin: 0 }}>
        Define and export App, Preview, or Demo in UserPreview.tsx.
      </pre>
    )
  }
  return <Cmp />
}
`

/** Ensures at least one of App / Preview / Demo is a named export for \`import * as U\`. */
function ensureComponentExports(body: string): string {
  let s = body.trim()
  s = s.replace(/export\s+default\s+function\s+(App|Preview|Demo)\b/g, 'export function $1')
  if (!/\bexport\s+function\s+App\b/.test(s) && /\bfunction\s+App\b/.test(s)) {
    s = s.replace(/\bfunction\s+App\b/, 'export function App')
  }
  if (!/\bexport\s+function\s+Preview\b/.test(s) && /\bfunction\s+Preview\b/.test(s)) {
    s = s.replace(/\bfunction\s+Preview\b/, 'export function Preview')
  }
  if (!/\bexport\s+function\s+Demo\b/.test(s) && /\bfunction\s+Demo\b/.test(s)) {
    s = s.replace(/\bfunction\s+Demo\b/, 'export function Demo')
  }
  return s
}

export function toUserPreviewModule(userCode: string): string {
  const body = ensureComponentExports(stripModuleSyntax(userCode))
  return `${REACT_HOOKS_IMPORT}\n${body}`
}

export function makeReactSandpackFiles(userCode: string): SandpackFiles {
  return {
    '/UserPreview.tsx': { code: toUserPreviewModule(userCode) },
    '/App.tsx': { code: APP_WRAPPER, hidden: true },
  }
}
