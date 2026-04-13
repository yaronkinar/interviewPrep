import { useEffect, useState } from 'react'
import {
  ANTHROPIC_API_KEY_LOCAL_KEY,
  ANTHROPIC_API_KEY_SESSION_KEY,
  ANTHROPIC_KEY_PERSIST_MODE_KEY,
  ANTHROPIC_MODEL_STORAGE_KEY,
  DEFAULT_ANTHROPIC_MODEL,
  normalizeAnthropicModel,
  readDefaultAnthropicKeyFromEnv,
} from './anthropicConstants'
import {
  GEMINI_API_KEY_LOCAL_KEY,
  GEMINI_API_KEY_SESSION_KEY,
  GEMINI_MODEL_STORAGE_KEY,
  DEFAULT_GEMINI_MODEL,
  GEMINI_MODEL_SUGGESTIONS,
  normalizeGeminiModel,
  readDefaultGeminiKeyFromEnv,
} from './geminiConstants'
import { LLM_PROVIDER_STORAGE_KEY, normalizeLlmProvider, type LlmProvider } from './llmConstants'
import {
  OPENAI_API_KEY_LOCAL_KEY,
  OPENAI_API_KEY_SESSION_KEY,
  OPENAI_MODEL_STORAGE_KEY,
  DEFAULT_OPENAI_MODEL,
  normalizeOpenaiModel,
  readDefaultOpenaiKeyFromEnv,
} from './openaiConstants'
import {
  GOOGLE_CLOUD_TTS_API_KEY_LOCAL_KEY,
  GOOGLE_CLOUD_TTS_API_KEY_SESSION_KEY,
  readDefaultGoogleCloudTtsKeyFromEnv,
} from './googleCloudTtsConstants'

export type KeyPersistMode = 'session' | 'local'

export interface AiSettingsSnapshot {
  provider: LlmProvider
  anthropicApiKey: string
  anthropicModel: string
  geminiApiKey: string
  geminiModel: string
  openaiApiKey: string
  openaiModel: string
}

function loadPersistMode(): KeyPersistMode {
  try {
    const v = localStorage.getItem(ANTHROPIC_KEY_PERSIST_MODE_KEY)
    return v === 'local' ? 'local' : 'session'
  } catch {
    return 'session'
  }
}

function loadProvider(): LlmProvider {
  try {
    return normalizeLlmProvider(localStorage.getItem(LLM_PROVIDER_STORAGE_KEY))
  } catch {
    return 'anthropic'
  }
}

function loadStoredAnthropicKey(mode: KeyPersistMode): string {
  try {
    if (mode === 'local') {
      return localStorage.getItem(ANTHROPIC_API_KEY_LOCAL_KEY) ?? ''
    }
    return sessionStorage.getItem(ANTHROPIC_API_KEY_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function loadStoredGeminiKey(mode: KeyPersistMode): string {
  try {
    if (mode === 'local') {
      return localStorage.getItem(GEMINI_API_KEY_LOCAL_KEY) ?? ''
    }
    return sessionStorage.getItem(GEMINI_API_KEY_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function loadStoredOpenaiKey(mode: KeyPersistMode): string {
  try {
    if (mode === 'local') {
      return localStorage.getItem(OPENAI_API_KEY_LOCAL_KEY) ?? ''
    }
    return sessionStorage.getItem(OPENAI_API_KEY_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function loadAnthropicModel(): string {
  try {
    const raw = localStorage.getItem(ANTHROPIC_MODEL_STORAGE_KEY)
    const normalized = normalizeAnthropicModel(raw)
    if (raw != null && raw !== normalized) {
      localStorage.setItem(ANTHROPIC_MODEL_STORAGE_KEY, normalized)
    }
    return normalized
  } catch {
    return DEFAULT_ANTHROPIC_MODEL
  }
}

function loadGeminiModel(): string {
  try {
    const raw = localStorage.getItem(GEMINI_MODEL_STORAGE_KEY)
    const normalized = normalizeGeminiModel(raw)
    if (raw != null && raw !== normalized) {
      localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, normalized)
    }
    return normalized
  } catch {
    return DEFAULT_GEMINI_MODEL
  }
}

function loadOpenaiModel(): string {
  try {
    const raw = localStorage.getItem(OPENAI_MODEL_STORAGE_KEY)
    const normalized = normalizeOpenaiModel(raw)
    if (raw != null && raw !== normalized) {
      localStorage.setItem(OPENAI_MODEL_STORAGE_KEY, normalized)
    }
    return normalized
  } catch {
    return DEFAULT_OPENAI_MODEL
  }
}

function persistAnthropicKey(mode: KeyPersistMode, key: string): void {
  try {
    sessionStorage.removeItem(ANTHROPIC_API_KEY_SESSION_KEY)
    localStorage.removeItem(ANTHROPIC_API_KEY_LOCAL_KEY)
    if (!key) {
      localStorage.setItem(ANTHROPIC_KEY_PERSIST_MODE_KEY, mode)
      return
    }
    if (mode === 'local') {
      localStorage.setItem(ANTHROPIC_API_KEY_LOCAL_KEY, key)
    } else {
      sessionStorage.setItem(ANTHROPIC_API_KEY_SESSION_KEY, key)
    }
    localStorage.setItem(ANTHROPIC_KEY_PERSIST_MODE_KEY, mode)
  } catch {
    // ignore
  }
}

function persistGeminiKey(mode: KeyPersistMode, key: string): void {
  try {
    sessionStorage.removeItem(GEMINI_API_KEY_SESSION_KEY)
    localStorage.removeItem(GEMINI_API_KEY_LOCAL_KEY)
    if (!key) {
      return
    }
    if (mode === 'local') {
      localStorage.setItem(GEMINI_API_KEY_LOCAL_KEY, key)
    } else {
      sessionStorage.setItem(GEMINI_API_KEY_SESSION_KEY, key)
    }
  } catch {
    // ignore
  }
}

function persistOpenaiKey(mode: KeyPersistMode, key: string): void {
  try {
    sessionStorage.removeItem(OPENAI_API_KEY_SESSION_KEY)
    localStorage.removeItem(OPENAI_API_KEY_LOCAL_KEY)
    if (!key) {
      return
    }
    if (mode === 'local') {
      localStorage.setItem(OPENAI_API_KEY_LOCAL_KEY, key)
    } else {
      sessionStorage.setItem(OPENAI_API_KEY_SESSION_KEY, key)
    }
  } catch {
    // ignore
  }
}

function persistProvider(provider: LlmProvider): void {
  try {
    localStorage.setItem(LLM_PROVIDER_STORAGE_KEY, provider)
  } catch {
    // ignore
  }
}

export interface ApiKeySettingsProps {
  onAiSettingsChange: (s: AiSettingsSnapshot) => void
  onElevenLabsChange?: (apiKey: string) => void
  onGoogleCloudTtsChange?: (apiKey: string) => void
}

const ELEVENLABS_API_KEY_SESSION_KEY = 'interviews:elevenlabsApiKeySession'
const ELEVENLABS_API_KEY_LOCAL_KEY = 'interviews:elevenlabsApiKeyLocal'

function loadStoredElevenLabsKey(mode: KeyPersistMode): string {
  try {
    if (mode === 'local') {
      return localStorage.getItem(ELEVENLABS_API_KEY_LOCAL_KEY) ?? ''
    }
    return sessionStorage.getItem(ELEVENLABS_API_KEY_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistElevenLabsKey(mode: KeyPersistMode, key: string): void {
  try {
    sessionStorage.removeItem(ELEVENLABS_API_KEY_SESSION_KEY)
    localStorage.removeItem(ELEVENLABS_API_KEY_LOCAL_KEY)
    if (!key) return
    if (mode === 'local') {
      localStorage.setItem(ELEVENLABS_API_KEY_LOCAL_KEY, key)
    } else {
      sessionStorage.setItem(ELEVENLABS_API_KEY_SESSION_KEY, key)
    }
  } catch {
    // ignore
  }
}

function loadStoredGoogleCloudTtsKey(mode: KeyPersistMode): string {
  try {
    if (mode === 'local') {
      return localStorage.getItem(GOOGLE_CLOUD_TTS_API_KEY_LOCAL_KEY) ?? ''
    }
    return sessionStorage.getItem(GOOGLE_CLOUD_TTS_API_KEY_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistGoogleCloudTtsKey(mode: KeyPersistMode, key: string): void {
  try {
    sessionStorage.removeItem(GOOGLE_CLOUD_TTS_API_KEY_SESSION_KEY)
    localStorage.removeItem(GOOGLE_CLOUD_TTS_API_KEY_LOCAL_KEY)
    if (!key) return
    if (mode === 'local') {
      localStorage.setItem(GOOGLE_CLOUD_TTS_API_KEY_LOCAL_KEY, key)
    } else {
      sessionStorage.setItem(GOOGLE_CLOUD_TTS_API_KEY_SESSION_KEY, key)
    }
  } catch {
    // ignore
  }
}

export default function ApiKeySettings({
  onAiSettingsChange,
  onElevenLabsChange,
  onGoogleCloudTtsChange,
}: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false)
  const [persistMode, setPersistMode] = useState<KeyPersistMode>(loadPersistMode)
  const [provider, setProvider] = useState<LlmProvider>(loadProvider)
  const [anthropicKeyInput, setAnthropicKeyInput] = useState('')
  const [anthropicModel, setAnthropicModel] = useState(loadAnthropicModel)
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [geminiModel, setGeminiModel] = useState(loadGeminiModel)
  const [openaiKeyInput, setOpenaiKeyInput] = useState('')
  const [openaiModel, setOpenaiModel] = useState(loadOpenaiModel)
  const [elevenLabsKeyInput, setElevenLabsKeyInput] = useState('')
  const [googleCloudTtsKeyInput, setGoogleCloudTtsKeyInput] = useState('')

  function emit(patch: Partial<AiSettingsSnapshot> = {}) {
    const base: AiSettingsSnapshot = {
      provider,
      anthropicApiKey: anthropicKeyInput.trim(),
      anthropicModel: anthropicModel.trim() || DEFAULT_ANTHROPIC_MODEL,
      geminiApiKey: geminiKeyInput.trim(),
      geminiModel: geminiModel.trim() || DEFAULT_GEMINI_MODEL,
      openaiApiKey: openaiKeyInput.trim(),
      openaiModel: openaiModel.trim() || DEFAULT_OPENAI_MODEL,
    }
    onAiSettingsChange({ ...base, ...patch })
  }

  useEffect(() => {
    const mode = loadPersistMode()
    setPersistMode(mode)
    let ak = loadStoredAnthropicKey(mode)
    if (!ak) {
      ak = readDefaultAnthropicKeyFromEnv()
    }
    let gk = loadStoredGeminiKey(mode)
    if (!gk) {
      gk = readDefaultGeminiKeyFromEnv()
    }
    let ok = loadStoredOpenaiKey(mode)
    if (!ok) {
      ok = readDefaultOpenaiKeyFromEnv()
    }
    setAnthropicKeyInput(ak)
    setGeminiKeyInput(gk)
    setOpenaiKeyInput(ok)
    const elevenLabsKey = loadStoredElevenLabsKey(mode)
    setElevenLabsKeyInput(elevenLabsKey)
    let gct = loadStoredGoogleCloudTtsKey(mode)
    if (!gct) {
      gct = readDefaultGoogleCloudTtsKeyFromEnv()
    }
    setGoogleCloudTtsKeyInput(gct)
    const am = loadAnthropicModel()
    const gm = loadGeminiModel()
    const om = loadOpenaiModel()
    setAnthropicModel(am)
    setGeminiModel(gm)
    setOpenaiModel(om)
    const p = loadProvider()
    setProvider(p)
    onAiSettingsChange({
      provider: p,
      anthropicApiKey: ak,
      anthropicModel: am,
      geminiApiKey: gk,
      geminiModel: gm,
      openaiApiKey: ok,
      openaiModel: om,
    })
    onElevenLabsChange?.(elevenLabsKey)
    onGoogleCloudTtsChange?.(gct)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync parent once on mount from storage
  }, [])

  function applySave() {
    persistAnthropicKey(persistMode, anthropicKeyInput.trim())
    persistGeminiKey(persistMode, geminiKeyInput.trim())
    persistOpenaiKey(persistMode, openaiKeyInput.trim())
    try {
      localStorage.setItem(ANTHROPIC_MODEL_STORAGE_KEY, anthropicModel.trim() || DEFAULT_ANTHROPIC_MODEL)
      localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, geminiModel.trim() || DEFAULT_GEMINI_MODEL)
      localStorage.setItem(OPENAI_MODEL_STORAGE_KEY, openaiModel.trim() || DEFAULT_OPENAI_MODEL)
      persistProvider(provider)
    } catch {
      // ignore
    }
    persistElevenLabsKey(persistMode, elevenLabsKeyInput.trim())
    persistGoogleCloudTtsKey(persistMode, googleCloudTtsKeyInput.trim())
    const am = anthropicModel.trim() || DEFAULT_ANTHROPIC_MODEL
    const gm = geminiModel.trim() || DEFAULT_GEMINI_MODEL
    const om = openaiModel.trim() || DEFAULT_OPENAI_MODEL
    setAnthropicModel(am)
    setGeminiModel(gm)
    setOpenaiModel(om)
    emit({
      anthropicModel: am,
      geminiModel: gm,
      openaiModel: om,
    })
    onElevenLabsChange?.(elevenLabsKeyInput.trim())
    onGoogleCloudTtsChange?.(googleCloudTtsKeyInput.trim())
  }

  function clearAnthropicKey() {
    setAnthropicKeyInput('')
    persistAnthropicKey(persistMode, '')
    emit({ anthropicApiKey: '' })
  }

  function clearGeminiKey() {
    setGeminiKeyInput('')
    persistGeminiKey(persistMode, '')
    emit({ geminiApiKey: '' })
  }

  function clearOpenaiKey() {
    setOpenaiKeyInput('')
    persistOpenaiKey(persistMode, '')
    emit({ openaiApiKey: '' })
  }

  function clearElevenLabsKey() {
    setElevenLabsKeyInput('')
    persistElevenLabsKey(persistMode, '')
    onElevenLabsChange?.('')
  }

  function clearGoogleCloudTtsKey() {
    setGoogleCloudTtsKeyInput('')
    persistGoogleCloudTtsKey(persistMode, '')
    onGoogleCloudTtsChange?.('')
  }

  function onProviderPick(next: LlmProvider) {
    setProvider(next)
    try {
      localStorage.setItem(LLM_PROVIDER_STORAGE_KEY, next)
    } catch {
      // ignore
    }
    emit({ provider: next })
  }

  const hasAnthropicKey = Boolean(anthropicKeyInput.trim())
  const hasGeminiKey = Boolean(geminiKeyInput.trim())
  const hasOpenaiKey = Boolean(openaiKeyInput.trim())
  const hasGoogleCloudTtsKey = Boolean(googleCloudTtsKeyInput.trim())

  return (
    <section className="q-ai-settings">
      <button
        type="button"
        className="q-ai-settings-toggle code-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '▼' : '▶'} AI API keys (Anthropic, Gemini, OpenAI)
      </button>
      {open && (
        <div className="q-ai-settings-panel">
          <p className="q-ai-settings-note">
            Keys are used only from this browser to call the provider you select. They are not sent to our servers.
            Storing keys in the browser carries XSS risk if this tab runs untrusted scripts—prefer <strong>Session</strong>{' '}
            when possible. Never commit keys to git. For local dev you can set{' '}
            <code className="q-ai-code">VITE_ANTHROPIC_API_KEY</code>, <code className="q-ai-code">VITE_GEMINI_API_KEY</code>, or{' '}
            <code className="q-ai-code">VITE_OPENAI_API_KEY</code>, or{' '}
            <code className="q-ai-code">VITE_GOOGLE_CLOUD_TTS_API_KEY</code>, or{' '}
            <code className="q-ai-code">VITE_GOOGLE_API_KEY</code> for one key that prefills both Gemini and TTS in dev (still exposed in the client bundle if you build with them).
          </p>

          <div className="q-ai-persist-row q-ai-provider-row">
            <span className="q-ai-label-inline">Use for chat &amp; mock interview:</span>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="llmProvider"
                checked={provider === 'anthropic'}
                onChange={() => onProviderPick('anthropic')}
              />
              Anthropic (Claude)
            </label>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="llmProvider"
                checked={provider === 'gemini'}
                onChange={() => onProviderPick('gemini')}
              />
              Google Gemini
            </label>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="llmProvider"
                checked={provider === 'openai'}
                onChange={() => onProviderPick('openai')}
              />
              OpenAI (ChatGPT API)
            </label>
          </div>

          <h3 className="q-ai-subheading">Anthropic</h3>
          <label className="q-ai-label">
            API key
            <input
              type="password"
              className="q-ai-input"
              placeholder="sk-ant-…"
              value={anthropicKeyInput}
              onChange={(e) => setAnthropicKeyInput(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="q-ai-label">
            Model
            <input
              type="text"
              className="q-ai-input q-ai-input-mono"
              value={anthropicModel}
              onChange={(e) => setAnthropicModel(e.target.value)}
              placeholder={DEFAULT_ANTHROPIC_MODEL}
            />
          </label>

          <h3 className="q-ai-subheading">Google Gemini</h3>
          <label className="q-ai-label">
            API key
            <input
              type="password"
              className="q-ai-input"
              placeholder="AIza…"
              value={geminiKeyInput}
              onChange={(e) => {
                const v = e.target.value
                setGeminiKeyInput(v)
                emit({ geminiApiKey: v.trim() })
              }}
              autoComplete="off"
            />
          </label>
          <label className="q-ai-label">
            Model
            <input
              type="text"
              className="q-ai-input q-ai-input-mono"
              list="interviews-gemini-model-suggestions"
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              placeholder={DEFAULT_GEMINI_MODEL}
            />
            <datalist id="interviews-gemini-model-suggestions">
              {GEMINI_MODEL_SUGGESTIONS.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
          </label>

          <h3 className="q-ai-subheading">OpenAI (ChatGPT)</h3>
          <label className="q-ai-label">
            API key
            <input
              type="password"
              className="q-ai-input"
              placeholder="sk-…"
              value={openaiKeyInput}
              onChange={(e) => setOpenaiKeyInput(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="q-ai-label">
            Model
            <input
              type="text"
              className="q-ai-input q-ai-input-mono"
              value={openaiModel}
              onChange={(e) => setOpenaiModel(e.target.value)}
              placeholder={DEFAULT_OPENAI_MODEL}
            />
          </label>

          <h3 className="q-ai-subheading">Voice (optional)</h3>
          <p className="q-ai-settings-note">
            <strong>Google Cloud TTS</strong> uses a Google Cloud API key with the{' '}
            <strong>Cloud Text-to-Speech API</strong> enabled (this is separate from the Gemini / AI Studio key unless you enable both on the same key).
            Browser calls require the key’s <strong>API restrictions</strong> to allow Cloud Text-to-Speech, and{' '}
            <strong>HTTP referrer</strong> restrictions (if any) to include your dev URL (e.g.{' '}
            <code className="q-ai-code">http://localhost:5173/*</code>).
          </p>
          <label className="q-ai-label">
            Google Cloud TTS API key (Neural2 voices in mock interview)
            <input
              type="password"
              className="q-ai-input"
              placeholder="AIza… (Cloud Console key)"
              value={googleCloudTtsKeyInput}
              onChange={(e) => {
                const v = e.target.value
                setGoogleCloudTtsKeyInput(v)
                onGoogleCloudTtsChange?.(v.trim())
              }}
              autoComplete="off"
            />
          </label>
          <label className="q-ai-label">
            ElevenLabs API key (alternative premium voice)
            <input
              type="password"
              className="q-ai-input"
              placeholder="xi-…"
              value={elevenLabsKeyInput}
              onChange={(e) => {
                const v = e.target.value
                setElevenLabsKeyInput(v)
                onElevenLabsChange?.(v.trim())
              }}
              autoComplete="off"
            />
          </label>

          <div className="q-ai-persist-row">
            <span className="q-ai-label-inline">Store keys:</span>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="keyPersist"
                checked={persistMode === 'session'}
                onChange={() => setPersistMode('session')}
              />
              Session (cleared when tab closes)
            </label>
            <label className="q-ai-radio">
              <input
                type="radio"
                name="keyPersist"
                checked={persistMode === 'local'}
                onChange={() => setPersistMode('local')}
              />
              This device (localStorage)
            </label>
          </div>
          <div className="q-ai-actions">
            <button type="button" className="secondary" onClick={applySave}>
              Save credentials
            </button>
            <button type="button" className="secondary" onClick={clearAnthropicKey} disabled={!hasAnthropicKey}>
              Clear Anthropic key
            </button>
            <button type="button" className="secondary" onClick={clearGeminiKey} disabled={!hasGeminiKey}>
              Clear Gemini key
            </button>
            <button type="button" className="secondary" onClick={clearOpenaiKey} disabled={!hasOpenaiKey}>
              Clear OpenAI key
            </button>
            <button
              type="button"
              className="secondary"
              onClick={clearElevenLabsKey}
              disabled={!elevenLabsKeyInput.trim()}
            >
              Clear ElevenLabs key
            </button>
            <button
              type="button"
              className="secondary"
              onClick={clearGoogleCloudTtsKey}
              disabled={!hasGoogleCloudTtsKey}
            >
              Clear Google Cloud TTS key
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
