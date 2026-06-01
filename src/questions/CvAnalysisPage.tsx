import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import PaywallModal from '@/components/PaywallModal'
import UsageCounter from '@/components/UsageCounter'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import ScreenHeader from '../components/layout/ScreenHeader'
import { useLocale } from '../i18n/LocaleContext'
import { isRtlLocale } from '../i18n/locale'
import ApiKeySettings, { type AiSettingsSnapshot } from './ApiKeySettings'
import { DEFAULT_ANTHROPIC_MODEL } from './anthropicConstants'
import { DEFAULT_GEMINI_MODEL, readDefaultGeminiKeyFromEnv } from './geminiConstants'
import { DEFAULT_OPENAI_MODEL } from './openaiConstants'
import CvDimensionScores from './CvDimensionScores'
import CvNextStepsPanel from './CvNextStepsPanel'
import { parseCvAnalysisResponse } from './cvAnalysisScore'
import { renderCvPlainTextToDataUrl } from './cvTextPreviewImage'
import ChatMarkdown from './ChatMarkdown'
import { formatApiError, streamLlmChat } from './llmStream'
import { clearCvSelfIntro, loadCvSelfIntro, saveCvSelfIntro } from './cvSelfIntroStorage'
import { PATH_FOR_PAGE } from '../routes'

const SYSTEM_CV_ANALYSIS = `You are an expert career coach and hiring specialist. The user is preparing for a job search and wants structured feedback on their CV or résumé.

Output format (required — exact line order, then Markdown):

1) First line only (no markdown):
   CV_SCORE: <integer 0-100> | <short label in the user's language>
   Overall hiring-readiness (100 = excellent).

2) Second line only (single-line JSON, no markdown):
   CV_DIMENSIONS: {"ats":N,"fit":N,"clarity":N}
   - ats: keywords, structure, and typical ATS / screening friendliness (0-100).
   - fit: match to the job posting text when provided; if no posting text, approximate general role/market alignment from the CV alone (0-100).
   - clarity: writing clarity, impact bullets, scannability (0-100).

3) Third line only (single-line JSON array, max 5 items):
   CV_STEPS: [{"t":"Short title","d":"One sentence action","c":"ats|fit|content|other"}]
   t = required title; d = optional detail; c = optional category for UI.
   Use c "fit" when the step targets the supplied job posting. If unsure, use "other" or omit c.
   If you have no steps, output CV_STEPS: []

4) Blank line, then Markdown sections (Overview, Strengths, Gaps & risks, ATS & formatting, Role fit when job text exists, Action items). You may explain scores here; do not omit lines 1–3.

When a job URL and/or job posting text is included in the user message, prioritize CV vs that role in the narrative and in CV_STEPS.

Rules:
- Be honest, specific, and constructive.
- Do not invent employers, degrees, dates, or skills not implied by the CV text.
- If the text is very short or not a CV, still output lines 1–3 (low scores, CV_STEPS explaining what is missing) then Markdown.
- If no target role was given, still give general job-search-oriented improvements.`

function buildCvSystemPrompt(locale: string): string {
  let langName = locale
  try {
    const base = locale.split('-')[0] ?? locale
    langName = new Intl.DisplayNames([locale], { type: 'language' }).of(base) ?? locale
  } catch {
    /* keep locale code */
  }
  return `${SYSTEM_CV_ANALYSIS}

[Output language — required: UI locale is ${langName} (BCP-47: ${locale}). Use ${langName} for: the line-1 label after the pipe; Markdown section headings and explanatory body text; and CV_STEPS "t"/"d" when they describe what to do (not the literal text to paste onto the file). **Résumé-facing suggestions** — proposed section titles, bullet lines, labels, or any copy meant to go **on** the CV — must stay in the **primary language of the CV body**; do not translate those into ${langName} unless the CV is already in ${langName}. If the CV mixes languages, follow the dominant one for those snippets. Do not default to English unless the locale is English. Keep these ASCII tokens unchanged: CV_SCORE:, CV_DIMENSIONS:, CV_STEPS:, and JSON keys ats, fit, clarity, t, d, c; each "c" is one of ats, fit, content, other (lowercase English).]`
}

const SYSTEM_CV_SELF_INTRO = `You write natural, confident spoken self-introductions for job interviews ("Tell me about yourself" / walk-me-through-your-background).

Goals:
- First person, present tense where natural; conversational but professional — not stiff or overly salesy.
- About 160–260 words spoken (roughly 60–90 seconds), unless the user's CV implies a shorter career narrative.
- Brief arc: relevant background → a few standout strengths aligned with the target → why this opportunity fits (when job context exists) → forward-looking closing.
- Do not invent employers, titles, dates, certifications, degrees, tools, or numbers not clearly supported by the CV or job posting. If something is ambiguous, soften the claim or omit it.

Output:
- Markdown only. Start with ## and a short title in the user's UI language (see bracketed block below).
- Then the continuous monologue the candidate can memorize or shorten. Optionally add a ### block for a shorter (~30s) variant in the same language.
- Optionally end with "### Tips" (title in the same language) — max 4 bullets on rehearsal. All of this must match the UI language below.
- No score lines, no JSON, no CV_SCORE format.`

function buildSelfIntroSystemPrompt(locale: string): string {
  let langName = locale
  try {
    const base = locale.split('-')[0] ?? locale
    langName = new Intl.DisplayNames([locale], { type: 'language' }).of(base) ?? locale
  } catch {
    /* keep locale code */
  }
  return `${SYSTEM_CV_SELF_INTRO}

[Language — required: The user's selected UI language is ${langName} (BCP-47 code: ${locale}). Write **all** output in ${langName}: every heading (## / ###), the full spoken self-introduction, the optional shorter spoken version, and any tips — so the candidate can rehearse and deliver the interview in their chosen language.

Source material (CV / job posting) may be in another language; **translate faithfully** into ${langName} for the spoken script — do not copy-paste undocumented foreign-language sentences as the script. Preserve proper names (people, companies, products) and universally used technical identifiers as commonly written; otherwise express everything in ${langName}. Never default to English unless ${locale} is English (en).]`
}

function isValidOptionalJobUrl(raw: string): boolean {
  const s = raw.trim()
  if (!s) return true
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export default function CvAnalysisPage() {
  const { locale, strings } = useLocale()
  const cv = strings.cvPage
  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'
  const { isSignedIn, isLoaded } = useAuth()

  const [aiSettings, setAiSettings] = useState<AiSettingsSnapshot>(() => ({
    provider: 'anthropic',
    anthropicApiKey: '',
    anthropicModel: DEFAULT_ANTHROPIC_MODEL,
    geminiApiKey: readDefaultGeminiKeyFromEnv(),
    geminiModel: DEFAULT_GEMINI_MODEL,
    openaiApiKey: '',
    openaiModel: DEFAULT_OPENAI_MODEL,
  }))

  const onAiSettingsChange = useCallback((s: AiSettingsSnapshot) => {
    setAiSettings(s)
  }, [])

  const apiKey =
    aiSettings.provider === 'gemini'
      ? aiSettings.geminiApiKey
      : aiSettings.provider === 'openai'
        ? aiSettings.openaiApiKey
        : aiSettings.anthropicApiKey
  const model =
    aiSettings.provider === 'gemini'
      ? aiSettings.geminiModel
      : aiSettings.provider === 'openai'
        ? aiSettings.openaiModel
        : aiSettings.anthropicModel

  const [cvText, setCvText] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [jobText, setJobText] = useState('')
  const [result, setResult] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dropActive, setDropActive] = useState(false)
  /** Raster of PDF page 1 after upload; cleared on reset or non-PDF extract. */
  const [cvPdfPreviewDataUrl, setCvPdfPreviewDataUrl] = useState<string | null>(null)
  /** Object URL for uploaded PNG/JPEG/WebP/GIF; must be revoked. */
  const cvImageObjectUrlRef = useRef<string | null>(null)
  const [cvImageObjectUrl, setCvImageObjectUrl] = useState<string | null>(null)
  /** Canvas PNG for pasted / Word text when there is no PDF or image file preview. */
  const [cvTextRasterUrl, setCvTextRasterUrl] = useState<string | null>(null)
  const [docxBusy, setDocxBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const exportBusy = docxBusy || pdfBusy
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [introResult, setIntroResult] = useState('')
  const [introStreaming, setIntroStreaming] = useState('')
  const [introLoading, setIntroLoading] = useState(false)
  const [introError, setIntroError] = useState<string | null>(null)
  /** True when POST /api/cv-self-intro fails but local save succeeded */
  const [introMongoSyncFailed, setIntroMongoSyncFailed] = useState(false)
  const [introCopied, setIntroCopied] = useState(false)
  /** Browser `setTimeout` id; avoid `ReturnType<typeof setTimeout>` (DOM vs Node typing). */
  const introCopiedTimerRef = useRef<number | null>(null)

  const [plan, setPlan] = useState<'free' | 'sprint' | 'pro'>('free')
  const [cvUsage, setCvUsage] = useState<{ used: number; limit: number } | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  const revokeAndSetImageObjectUrl = useCallback((next: string | null) => {
    const prev = cvImageObjectUrlRef.current
    if (prev && prev !== next) URL.revokeObjectURL(prev)
    cvImageObjectUrlRef.current = next
    setCvImageObjectUrl(next)
  }, [])

  useEffect(() => {
    function endDrag() {
      setDropActive(false)
    }
    window.addEventListener('dragend', endDrag)
    return () => window.removeEventListener('dragend', endDrag)
  }, [])

  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.json())
      .then((data: { plan: string; aiUsage: { cvAnalysisCount: number } }) => {
        const p = data.plan as 'free' | 'sprint' | 'pro'
        setPlan(p)
        if (p === 'free') {
          setCvUsage({ used: data.aiUsage.cvAnalysisCount, limit: 1 })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      const u = cvImageObjectUrlRef.current
      if (u) URL.revokeObjectURL(u)
      cvImageObjectUrlRef.current = null
    }
  }, [])

  useEffect(() => {
    if (cvPdfPreviewDataUrl || cvImageObjectUrl) {
      setCvTextRasterUrl(null)
      return
    }
    const text = cvText.trim()
    if (!text) {
      setCvTextRasterUrl(null)
      return
    }
    const id = window.setTimeout(() => {
      setCvTextRasterUrl(renderCvPlainTextToDataUrl(cvText))
    }, 160)
    return () => window.clearTimeout(id)
  }, [cvText, cvPdfPreviewDataUrl, cvImageObjectUrl])

  const jobUrlLooksInvalid = jobUrl.trim().length > 0 && !isValidOptionalJobUrl(jobUrl)
  const llmBusy = loading || introLoading
  const canRunCvRequest =
    apiKey.trim().length > 0 && cvText.trim().length > 0 && !llmBusy && !jobUrlLooksInvalid

  useEffect(() => {
    return () => {
      if (introCopiedTimerRef.current != null) window.clearTimeout(introCopiedTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    setIntroResult('')
    setIntroStreaming('')
    setIntroError(null)
    setIntroMongoSyncFailed(false)

    let cancelled = false

    async function hydrateIntro() {
      if (isSignedIn) {
        try {
          const r = await fetch(`/api/cv-self-intro?locale=${encodeURIComponent(locale)}`)
          if (cancelled || !r.ok) throw new Error('remote skip')
          const j = (await r.json()) as { markdown?: string | null; locale?: string }
          const remote = String(j.markdown ?? '').trim()
          if (remote) {
            saveCvSelfIntro(remote, locale)
            if (!cancelled) setIntroResult(remote)
            return
          }
        } catch {
          /* fall through to local */
        }
      }

      const local = loadCvSelfIntro(locale)
      if (local?.markdown.trim() && !cancelled) {
        setIntroResult(local.markdown)
      }
    }

    void hydrateIntro()
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, locale])

  const downloadStyledDocx = useCallback(async () => {
    if (!cvText.trim()) return
    setDocxBusy(true)
    try {
      const { plainTextToYaronStyleDocx } = await import('./cvYaronStyleDocx')
      const out = await plainTextToYaronStyleDocx(cvText)
      if (!out) return
      const url = URL.createObjectURL(out.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${out.baseName}_Resume.docx`
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDocxBusy(false)
    }
  }, [cvText])

  const downloadStyledPdf = useCallback(async () => {
    if (!cvText.trim()) return
    setPdfBusy(true)
    try {
      const { plainTextToYaronStylePdf } = await import('./cvYaronStylePdf')
      const out = await plainTextToYaronStylePdf(cvText)
      if (!out) return
      const url = URL.createObjectURL(out.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${out.baseName}_Resume.pdf`
      a.rel = 'noopener'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfBusy(false)
    }
  }, [cvText])

  const clearAll = useCallback(() => {
    setCvText('')
    setCvPdfPreviewDataUrl(null)
    revokeAndSetImageObjectUrl(null)
    setCvTextRasterUrl(null)
    setJobUrl('')
    setJobText('')
    setResult('')
    setStreaming('')
    setError(null)
    setIntroResult('')
    setIntroStreaming('')
    setIntroLoading(false)
    setIntroError(null)
    setIntroMongoSyncFailed(false)
    setIntroCopied(false)
    clearCvSelfIntro(locale)
    if (isSignedIn) {
      void fetch(`/api/cv-self-intro?locale=${encodeURIComponent(locale)}`, {
        method: 'DELETE',
      }).catch(() => {})
    }
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [revokeAndSetImageObjectUrl, isSignedIn, locale])

  const forgetSavedIntro = useCallback(() => {
    clearCvSelfIntro(locale)
    setIntroResult('')
    setIntroStreaming('')
    setIntroError(null)
    setIntroMongoSyncFailed(false)
    setIntroCopied(false)
    if (isSignedIn) {
      void fetch(`/api/cv-self-intro?locale=${encodeURIComponent(locale)}`, {
        method: 'DELETE',
      }).catch(() => {})
    }
  }, [isSignedIn, locale])

  async function processCvFile(file: File) {
    setUploadError(null)
    setUploadBusy(true)
    try {
      const { extractCvFileText } = await import('./extractCvFileText')
      const out = await extractCvFileText(file)
      if (out.ok) {
        setCvText(out.text)
        setCvPdfPreviewDataUrl(out.pdfPreviewDataUrl)
        revokeAndSetImageObjectUrl(out.imageObjectUrl)
      } else {
        setCvPdfPreviewDataUrl(null)
        revokeAndSetImageObjectUrl(null)
        const msg =
          out.code === 'too_large'
            ? cv.uploadTooLarge
            : out.code === 'unsupported'
              ? cv.uploadUnsupported
              : out.code === 'empty'
                ? cv.uploadEmpty
                : cv.uploadReadError
        setUploadError(msg)
      }
    } finally {
      setUploadBusy(false)
    }
  }

  async function onCvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await processCvFile(file)
  }

  function onDropZoneDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (loading || introLoading || uploadBusy) return
    if (!e.dataTransfer.types.includes('Files')) return
    e.dataTransfer.dropEffect = 'copy'
    setDropActive(true)
  }

  function onDropZoneDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const next = e.relatedTarget as Node | null
    if (next && e.currentTarget.contains(next)) return
    setDropActive(false)
  }

  async function onDropZoneDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDropActive(false)
    if (loading || introLoading || uploadBusy) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await processCvFile(file)
  }

  function onJobUrlChange(value: string) {
    setJobUrl(value)
  }

  async function analyze() {
    if (!canRunCvRequest) return
    setError(null)
    setResult('')
    setStreaming('')
    setLoading(true)

    if (plan === 'free') {
      try {
        const res = await fetch('/api/ai-usage/cv-analysis', { method: 'POST' })
        const data = await res.json() as { allowed: boolean; used: number; limit: number }
        if (!data.allowed) {
          setShowPaywall(true)
          setLoading(false)
          return
        }
        setCvUsage({ used: data.used, limit: data.limit })
      } catch {
        // Network error — allow the analysis to proceed (fail open, not closed)
        setLoading(false)
        return
      }
    }

    const jobUrlBlock = jobUrl.trim().length > 0 ? jobUrl.trim() : cv.promptJobUrlNone
    const jobBlock =
      jobText.trim().length > 0 ? jobText.trim() : cv.promptNoJobPostingText

    const userContent = `${cv.promptSectionCv}\n${cvText.trim()}\n\n${cv.promptSectionJobUrl}\n${jobUrlBlock}\n\n${cv.promptSectionJobText}\n${jobBlock}`

    const messages: MessageParam[] = [{ role: 'user', content: userContent }]
    let acc = ''

    try {
      await streamLlmChat({
        provider: aiSettings.provider,
        apiKey: apiKey.trim(),
        model: model.trim(),
        system: buildCvSystemPrompt(locale),
        locale,
        messages,
        maxTokens: 4096,
        onTextDelta: (d) => {
          acc += d
          setStreaming(acc)
        },
      })
      setResult(acc)
      setStreaming('')
    } catch (e) {
      setError(formatApiError(e))
      setStreaming('')
    } finally {
      setLoading(false)
    }
  }

  async function generateSelfIntro() {
    if (!canRunCvRequest) return
    setIntroError(null)
    setIntroMongoSyncFailed(false)
    setIntroResult('')
    setIntroStreaming('')
    setIntroCopied(false)
    setIntroLoading(true)

    const jobUrlBlock = jobUrl.trim().length > 0 ? jobUrl.trim() : cv.promptJobUrlNone
    const jobBlock =
      jobText.trim().length > 0 ? jobText.trim() : cv.promptNoJobPostingText

    const userContent = `${cv.promptSectionCv}\n${cvText.trim()}\n\n${cv.promptSectionJobUrl}\n${jobUrlBlock}\n\n${cv.promptSectionJobText}\n${jobBlock}`

    const messages: MessageParam[] = [{ role: 'user', content: userContent }]
    let acc = ''

    try {
      await streamLlmChat({
        provider: aiSettings.provider,
        apiKey: apiKey.trim(),
        model: model.trim(),
        system: buildSelfIntroSystemPrompt(locale),
        locale,
        messages,
        maxTokens: 2048,
        onTextDelta: (d) => {
          acc += d
          setIntroStreaming(acc)
        },
      })
      setIntroResult(acc)
      saveCvSelfIntro(acc, locale)

      if (isSignedIn) {
        try {
          const r = await fetch('/api/cv-self-intro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown: acc, locale }),
          })
          setIntroMongoSyncFailed(!r.ok)
        } catch {
          setIntroMongoSyncFailed(true)
        }
      }

      setIntroStreaming('')
    } catch (e) {
      setIntroError(formatApiError(e))
      setIntroStreaming('')
    } finally {
      setIntroLoading(false)
    }
  }

  async function copyIntroScript() {
    const text = introResult.trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setIntroCopied(true)
      const prev = introCopiedTimerRef.current
      if (prev != null) window.clearTimeout(prev)
      introCopiedTimerRef.current = window.setTimeout(() => setIntroCopied(false), 2000)
    } catch {
      setIntroCopied(false)
    }
  }

  const displayText = streaming || result
  const { score: parsedScore, dimensions, steps, displayMarkdown } = useMemo(
    () => parseCvAnalysisResponse(displayText),
    [displayText],
  )

  const markdownBody = displayMarkdown.trim()
  const scoreLineStreaming =
    loading && streaming && /^CV_SCORE:/i.test(displayText.trimStart()) && !markdownBody && !parsedScore

  function renderAnalysisBubbleBody(): ReactNode {
    if (loading && !streaming) {
      return (
        <div className="q-chat-text">
          <span className="q-chat-typing">…</span>
        </div>
      )
    }
    if (markdownBody) {
      return <ChatMarkdown content={displayMarkdown} />
    }
    if (loading && streaming && (parsedScore || scoreLineStreaming)) {
      return (
        <div className="q-chat-text">
          <span className="q-chat-typing">…</span>
        </div>
      )
    }
    if (displayText.trim() && !/^CV_SCORE:/i.test(displayText.trimStart())) {
      return <ChatMarkdown content={displayText} />
    }
    return null
  }

  const analysisBubbleBody = renderAnalysisBubbleBody()
  const showAnalysisBubble = !error && (loading || analysisBubbleBody !== null)

  const introDisplayText = introStreaming || introResult
  const renderIntroBubbleBody = (): ReactNode => {
    if (introLoading && !introStreaming) {
      return (
        <div className="q-chat-text">
          <span className="q-chat-typing">…</span>
        </div>
      )
    }
    if (introDisplayText.trim()) {
      return <ChatMarkdown content={introDisplayText} />
    }
    return null
  }
  const introBubbleBody = renderIntroBubbleBody()
  const showIntroBubble = !introError && (introLoading || introBubbleBody !== null)

  const jobUrlTrim = jobUrl.trim()
  const canOpenJobLink = jobUrlTrim.length > 0 && isValidOptionalJobUrl(jobUrl)

  const previewImageSrc = cvPdfPreviewDataUrl ?? cvImageObjectUrl ?? cvTextRasterUrl
  const previewImageAlt = cvPdfPreviewDataUrl
    ? cv.cvPreviewImageAlt
    : cvImageObjectUrl
      ? cv.cvPreviewUploadImageAlt
      : cv.cvPreviewTextImageAlt

  return (
    <div className="editorial-page editorial-page--cv cv-analysis-page" dir={contentDir}>
      <ScreenHeader title={cv.title} lead={cv.lead} align="start" />

      <p className="cv-analysis-theme-link-wrap">
        <Link className="cv-analysis-theme-link" href={PATH_FOR_PAGE.cvThemes}>
          {cv.themeGeneratorLink}
        </Link>
      </p>

      <section className="editorial-panel cv-analysis-settings" aria-label="AI settings">
        <ApiKeySettings onAiSettingsChange={onAiSettingsChange} />
      </section>

      <section className="editorial-panel cv-analysis-form" aria-labelledby="cv-form-heading">
        <h2 id="cv-form-heading" className="cv-analysis-form-title">
          {cv.sectionHeading}
        </h2>
        <label className="cv-analysis-label" htmlFor="cv-analysis-cv">
          {cv.cvLabel}
        </label>
        <div className="cv-analysis-cv-editor-preview">
          <div className="cv-analysis-cv-editor-col">
            <div className="cv-analysis-upload-row">
              <input
                ref={fileInputRef}
                id="cv-analysis-file"
                type="file"
                className="cv-analysis-file-input"
                accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => void onCvFileChange(e)}
                disabled={llmBusy || uploadBusy}
                aria-label={cv.uploadButton}
              />
              <button
                type="button"
                className="secondary cv-analysis-upload-btn"
                disabled={llmBusy || uploadBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadBusy ? cv.uploadParsing : cv.uploadButton}
              </button>
              <span className="cv-analysis-upload-meta">{cv.uploadLabel}</span>
            </div>
            <p className="cv-analysis-hint cv-analysis-hint--upload">{cv.uploadHint}</p>
            <div
              className={`cv-analysis-drop-zone${dropActive ? ' cv-analysis-drop-zone--active' : ''}${loading || introLoading || uploadBusy ? ' cv-analysis-drop-zone--disabled' : ''}`}
              onDragOver={onDropZoneDragOver}
              onDragLeave={onDropZoneDragLeave}
              onDrop={(e) => void onDropZoneDrop(e)}
              role="region"
              aria-label={cv.dropZoneHint}
            >
              <p className="cv-analysis-drop-zone-text">
                {uploadBusy ? cv.uploadParsing : dropActive ? cv.dropZoneActive : cv.dropZoneHint}
              </p>
            </div>
            {uploadError && <p className="q-chat-error cv-analysis-upload-error">{uploadError}</p>}
            <textarea
              id="cv-analysis-cv"
              className="cv-analysis-textarea cv-analysis-textarea--cv-main"
              rows={14}
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder={cv.cvPlaceholder}
              disabled={llmBusy}
              spellCheck
            />
            {cvImageObjectUrl && cvText.trim().length === 0 ? (
              <p className="cv-analysis-hint cv-analysis-hint--image-note">{cv.cvImageNeedTextHint}</p>
            ) : null}
          </div>
          <div className="cv-analysis-cv-preview-col">
            <div id="cv-analysis-preview-heading" className="cv-analysis-label">
              {cv.cvPreviewHeading}
            </div>
            <div
              className="cv-analysis-preview-pane"
              dir="auto"
              role="region"
              aria-labelledby="cv-analysis-preview-heading"
            >
              {previewImageSrc ? (
                <div className="cv-analysis-preview-image-wrap">
                  <img
                    src={previewImageSrc}
                    alt={previewImageAlt}
                    className="cv-analysis-preview-image"
                    decoding="async"
                  />
                </div>
              ) : (
                <p className="cv-analysis-preview-empty">{cv.cvPreviewPlaceholder}</p>
              )}
            </div>
          </div>
        </div>

        <label className="cv-analysis-label" htmlFor="cv-analysis-job-url">
          {cv.jobUrlLabel}
        </label>
        <p className="cv-analysis-hint">{cv.jobPasteHint}</p>
        <div className="cv-analysis-job-url-row">
          <input
            id="cv-analysis-job-url"
            type="url"
            className="cv-analysis-job-url-input"
            value={jobUrl}
            onChange={(e) => onJobUrlChange(e.target.value)}
            placeholder={cv.jobUrlPlaceholder}
            disabled={llmBusy}
            autoComplete="url"
          />
          <button
            type="button"
            className="secondary"
            disabled={!canOpenJobLink || llmBusy}
            onClick={() => {
              if (!canOpenJobLink) return
              window.open(jobUrlTrim, '_blank', 'noopener,noreferrer')
            }}
          >
            {cv.jobUrlOpen}
          </button>
        </div>
        {jobUrlLooksInvalid && <p className="q-chat-error cv-analysis-upload-error">{cv.jobUrlInvalid}</p>}

        <label className="cv-analysis-label" htmlFor="cv-analysis-job">
          {cv.jobLabel}
        </label>
        <p className="cv-analysis-hint">{cv.jobHelp}</p>
        <textarea
          id="cv-analysis-job"
          className="cv-analysis-textarea cv-analysis-textarea--job"
          rows={6}
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder={cv.jobPlaceholder}
          disabled={llmBusy}
          spellCheck
        />

        <p className="cv-analysis-hint">{cv.selfIntroHint}</p>

        <div className="cv-analysis-actions">
          <button type="button" onClick={() => void analyze()} disabled={!canRunCvRequest}>
            {loading ? cv.analyzing : cv.analyze}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void generateSelfIntro()}
            disabled={!canRunCvRequest}
          >
            {introLoading ? cv.selfIntroWorking : cv.selfIntroGenerate}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void downloadStyledDocx()}
            disabled={!cvText.trim() || llmBusy || exportBusy}
          >
            {docxBusy ? strings.cvThemePage.docxWorking : cv.downloadStyledDocx}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void downloadStyledPdf()}
            disabled={!cvText.trim() || llmBusy || exportBusy}
          >
            {pdfBusy ? strings.cvThemePage.pdfWorking : cv.downloadStyledPdf}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={clearAll}
            disabled={
              llmBusy ||
              (cvText.trim().length === 0 &&
                jobUrlTrim.length === 0 &&
                jobText.trim().length === 0 &&
                !result &&
                !streaming &&
                !introResult &&
                !introStreaming &&
                !introError)
            }
          >
            {cv.reset}
          </button>
        </div>

        {cvUsage && plan === 'free' && (
          <UsageCounter used={cvUsage.used} limit={cvUsage.limit} feature="cvAnalysis" />
        )}
        <PaywallModal
          open={showPaywall}
          onClose={() => setShowPaywall(false)}
          feature="cvAnalysis"
        />

        {!apiKey.trim() && <p className="q-chat-warn">{cv.apiKeyHint}</p>}
      </section>

      {(loading || displayText || error) && (
        <section className="editorial-panel cv-analysis-result" aria-labelledby="cv-result-heading">
          <h2 id="cv-result-heading" className="cv-analysis-form-title">
            {cv.resultTitle}
          </h2>
          {error && <div className="q-chat-error">{error}</div>}
          {parsedScore && !error && (
            <div className="cv-analysis-score-card" aria-label={`${cv.scoreHeading}: ${parsedScore.score}${cv.scoreOutOf}`}>
              <div className="cv-analysis-score-card-inner">
                <p className="cv-analysis-score-heading">{cv.scoreHeading}</p>
                <div className="cv-analysis-score-row">
                  <span className="cv-analysis-score-value">{parsedScore.score}</span>
                  <span className="cv-analysis-score-outof">{cv.scoreOutOf}</span>
                </div>
                <p className="cv-analysis-score-summary">{parsedScore.summary}</p>
                <p className="cv-analysis-score-disclaimer">{cv.scoreDisclaimer}</p>
              </div>
            </div>
          )}
          {dimensions && !error && <CvDimensionScores dimensions={dimensions} cv={cv} />}
          {steps.length > 0 && !error && <CvNextStepsPanel steps={steps} cv={cv} />}
          {showAnalysisBubble && (
            <div className="q-chat-bubble q-chat-bubble--assistant cv-analysis-result-bubble">
              <span className="q-chat-role">{cv.assistantLabel}</span>
              {analysisBubbleBody}
            </div>
          )}
          <p className="cv-analysis-privacy">{cv.privacyNote}</p>
        </section>
      )}

      {(introLoading || introDisplayText.trim().length > 0 || introError) && (
        <section className="editorial-panel cv-analysis-result" aria-labelledby="cv-intro-result-heading">
          <h2 id="cv-intro-result-heading" className="cv-analysis-form-title">
            {cv.selfIntroSectionTitle}
          </h2>
          {introError && <div className="q-chat-error">{introError}</div>}
          {introResult.trim() && !introLoading && !introError && (
            <>
              <div className="cv-analysis-intro-actions">
                <button type="button" className="secondary" onClick={() => void copyIntroScript()}>
                  {introCopied ? cv.selfIntroCopied : cv.selfIntroCopy}
                </button>
                <button type="button" className="secondary" onClick={forgetSavedIntro}>
                  {cv.selfIntroForgetSaved}
                </button>
              </div>
              <p className="cv-analysis-hint cv-analysis-intro-persist-hint">
                {isSignedIn ? cv.selfIntroPersistHintSignedIn : cv.selfIntroPersistHint}
              </p>
              {introMongoSyncFailed ? (
                <p className="q-chat-warn cv-analysis-intro-sync-warn" role="status">
                  {cv.selfIntroMongoSyncFailed}
                </p>
              ) : null}
            </>
          )}
          {showIntroBubble && (
            <div className="q-chat-bubble q-chat-bubble--assistant cv-analysis-result-bubble">
              <span className="q-chat-role">{cv.assistantLabel}</span>
              {introBubbleBody}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
