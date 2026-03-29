/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site origin (no trailing slash), e.g. https://example.com */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@babel/plugin-transform-typescript' {
  const plugin: unknown
  export default plugin
}
