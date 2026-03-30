import { useEffect, useState } from 'react'
import {
  ANTHROPIC_API_KEY_LOCAL_KEY,
  ANTHROPIC_API_KEY_SESSION_KEY,
  ANTHROPIC_KEY_PERSIST_MODE_KEY,
  ANTHROPIC_MODEL_STORAGE_KEY,
  DEFAULT_ANTHROPIC_MODEL,
  normalizeAnthropicModel,
} from './anthropicConstants'

export type KeyPersistMode = 'session' | 'local'

function loadPersistMode(): KeyPersistMode {
  try {
    const v = localStorage.getItem(ANTHROPIC_KEY_PERSIST_MODE_KEY)
    return v === 'local' ? 'local' : 'session'
  } catch {
    return 'session'
  }
}

function loadStoredKey(mode: KeyPersistMode): string {
  try {
    if (mode === 'local') {
      return localStorage.getItem(ANTHROPIC_API_KEY_LOCAL_KEY) ?? ''
    }
    return sessionStorage.getItem(ANTHROPIC_API_KEY_SESSION_KEY) ?? ''
  } catch {
    return ''
  }
}

function loadModel(): string {
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

function persistKey(mode: KeyPersistMode, key: string): void {
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

export interface ApiKeySettingsProps {
  onCredentialsChange: (apiKey: string, model: string) => void
  onElevenLabsChange?: (apiKey: string) => void
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

export default function ApiKeySettings({ onCredentialsChange, onElevenLabsChange }: ApiKeySettingsProps) {
  const [open, setOpen] = useState(false)
  const [persistMode, setPersistMode] = useState<KeyPersistMode>(loadPersistMode)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [model, setModel] = useState(loadModel)
  const [elevenLabsKeyInput, setElevenLabsKeyInput] = useState('')

  useEffect(() => {
    const mode = loadPersistMode()
    setPersistMode(mode)
    const key = loadStoredKey(mode)
    const elevenLabsKey = loadStoredElevenLabsKey(mode)
    setApiKeyInput(key)
    setElevenLabsKeyInput(elevenLabsKey)
    const m = loadModel()
    setModel(m)
    onCredentialsChange(key, m)
    onElevenLabsChange?.(elevenLabsKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync parent once on mount from storage
  }, [])

  function applySave() {
    persistKey(persistMode, apiKeyInput.trim())
    persistElevenLabsKey(persistMode, elevenLabsKeyInput.trim())
    try {
      localStorage.setItem(ANTHROPIC_MODEL_STORAGE_KEY, model.trim() || DEFAULT_ANTHROPIC_MODEL)
    } catch {
      // ignore
    }
    const m = model.trim() || DEFAULT_ANTHROPIC_MODEL
    setModel(m)
    onCredentialsChange(apiKeyInput.trim(), m)
    onElevenLabsChange?.(elevenLabsKeyInput.trim())
  }

  function clearKey() {
    setApiKeyInput('')
    persistKey(persistMode, '')
    onCredentialsChange('', model.trim() || DEFAULT_ANTHROPIC_MODEL)
  }
  function clearElevenLabsKey() {
    setElevenLabsKeyInput('')
    persistElevenLabsKey(persistMode, '')
    onElevenLabsChange?.('')
  }

  const hasKey = Boolean(apiKeyInput.trim())

  return (
    <section className="q-ai-settings">
      <button
        type="button"
        className="q-ai-settings-toggle code-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '▼' : '▶'} Anthropic API
      </button>
      {open && (
        <div className="q-ai-settings-panel">
          <p className="q-ai-settings-note">
            Your key is used only from this browser to call Anthropic. It is not sent to our servers.
            Storing it in the browser carries XSS risk if this tab runs untrusted scripts—prefer{' '}
            <strong>Session</strong> when possible. Never commit keys to git.
          </p>
          <label className="q-ai-label">
            API key
            <input
              type="password"
              className="q-ai-input"
              placeholder="sk-ant-…"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="q-ai-label">
            Model
            <input
              type="text"
              className="q-ai-input q-ai-input-mono"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={DEFAULT_ANTHROPIC_MODEL}
            />
          </label>
          <label className="q-ai-label">
            ElevenLabs API key (voice quality upgrade)
            <input
              type="password"
              className="q-ai-input"
              placeholder="xi-…"
              value={elevenLabsKeyInput}
              onChange={(e) => setElevenLabsKeyInput(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="q-ai-persist-row">
            <span className="q-ai-label-inline">Store key:</span>
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
            <button type="button" className="secondary" onClick={clearKey} disabled={!hasKey}>
              Clear key
            </button>
            <button
              type="button"
              className="secondary"
              onClick={clearElevenLabsKey}
              disabled={!elevenLabsKeyInput.trim()}
            >
              Clear ElevenLabs key
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
