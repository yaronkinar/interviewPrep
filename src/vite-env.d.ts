/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site origin (no trailing slash), e.g. https://example.com */
  readonly VITE_SITE_URL?: string
  /** Optional: prefill Anthropic API key in dev (bundled into client — do not use for production secrets). */
  readonly VITE_ANTHROPIC_API_KEY?: string
  /** Optional: prefill Gemini API key in dev (bundled into client — do not use for production secrets). */
  readonly VITE_GEMINI_API_KEY?: string
  /** Optional: single Google key for dev — used for Gemini and Cloud TTS when the specific vars below are unset. */
  readonly VITE_GOOGLE_API_KEY?: string
  /** Optional: prefill Google Cloud Text-to-Speech key (overrides VITE_GOOGLE_API_KEY for TTS only). */
  readonly VITE_GOOGLE_CLOUD_TTS_API_KEY?: string
  /** Optional: prefill OpenAI API key in dev (bundled into client — do not use for production secrets). */
  readonly VITE_OPENAI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@babel/plugin-transform-typescript' {
  const plugin: unknown
  export default plugin
}
