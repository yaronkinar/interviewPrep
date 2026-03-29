import type { Monaco } from '@monaco-editor/react'

let monacoInterviewTsConfigured = false

/**
 * Minimal libs so TSX + automatic JSX + hooks get completions in the browser TS worker.
 * (Not a full @types/react — enough for IntelliSense in interview snippets.)
 */
const INTERVIEW_TSX_GLOBAL_LIB = `
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>
  }
  type Element = unknown
}

declare module 'react/jsx-runtime' {
  export function jsx(type: unknown, props: unknown, key?: string | number): unknown
  export function jsxs(type: unknown, props: unknown, key?: string | number): unknown
  export const Fragment: unique symbol
}

declare module 'react' {
  export function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  export function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: readonly unknown[]): T
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  export function useRef<T>(initial: T): { current: T }
  export function useReducer<R, A>(
    reducer: (state: R, action: A) => R,
    initial: R
  ): [R, (action: A) => void]
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  export function useId(): string
  export const Fragment: unique symbol
  export function createElement(type: unknown, props?: unknown, ...children: unknown[]): unknown
  type FC<P = Record<string, never>> = (props: P) => JSX.Element | null
  export type { FC }
}

export {}
`

/** Run once per page load — enables semantic checking, suggestions, and TSX (react-jsx). */
export function configureMonacoInterviewTypeScript(monaco: Monaco): void {
  if (monacoInterviewTsConfigured) return
  monacoInterviewTsConfigured = true

  const ts = monaco.languages.typescript

  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
    diagnosticCodesToIgnore: [
      1375, // "await" only allowed at top level — rare noise in snippets
    ],
  })

  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
  })

  const compilerOpts: Parameters<typeof ts.typescriptDefaults.setCompilerOptions>[0] = {
    target: ts.ScriptTarget.ES2022,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: false,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: 'react',
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: false,
    strictNullChecks: false,
    skipLibCheck: true,
    lib: ['es2022', 'dom', 'dom.iterable'],
  }

  ts.typescriptDefaults.setCompilerOptions(compilerOpts)
  ts.javascriptDefaults.setCompilerOptions(compilerOpts)

  /** Sync open TS/JS models into the worker up front so completions are not raced on first keystroke. */
  ts.typescriptDefaults.setEagerModelSync(true)
  ts.javascriptDefaults.setEagerModelSync(true)

  ts.typescriptDefaults.addExtraLib(INTERVIEW_TSX_GLOBAL_LIB, 'file:///globals/interview-tsx-shim.d.ts')
}
