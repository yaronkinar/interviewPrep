import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
import ChatMarkdown from './ChatMarkdown'
import { formatApiError, streamLlmChat } from './llmStream'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function endDrag() {
      setDropActive(false)
    }
    window.addEventListener('dragend', endDrag)
    return () => window.removeEventListener('dragend', endDrag)
  }, [])

  const jobUrlLooksInvalid = jobUrl.trim().length > 0 && !isValidOptionalJobUrl(jobUrl)
  const canAnalyze =
    apiKey.trim().length > 0 && cvText.trim().length > 0 && !loading && !jobUrlLooksInvalid

  const clearAll = useCallback(() => {
    setCvText('')
    setCvPdfPreviewDataUrl(null)
    setJobUrl('')
    setJobText('')
    setResult('')
    setStreaming('')
    setError(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  async function processCvFile(file: File) {
    setUploadError(null)
    setUploadBusy(true)
    try {
      const { extractCvFileText } = await import('./extractCvFileText')
      const out = await extractCvFileText(file)
      if (out.ok) {
        setCvText(out.text)
        setCvPdfPreviewDataUrl(out.pdfPreviewDataUrl)
      } else {
        setCvPdfPreviewDataUrl(null)
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
    if (loading || uploadBusy) return
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
    if (loading || uploadBusy) return
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await processCvFile(file)
  }

  function onJobUrlChange(value: string) {
    setJobUrl(value)
  }

  async function analyze() {
    if (!canAnalyze) return
    setError(null)
    setResult('')
    setStreaming('')
    setLoading(true)

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

  const jobUrlTrim = jobUrl.trim()
  const canOpenJobLink = jobUrlTrim.length > 0 && isValidOptionalJobUrl(jobUrl)

  return (
    <div className="editorial-page editorial-page--cv cv-analysis-page" dir={contentDir}>
      <ScreenHeader title={cv.title} lead={cv.lead} align="start" />

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
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => void onCvFileChange(e)}
                disabled={loading || uploadBusy}
                aria-label={cv.uploadButton}
              />
              <button
                type="button"
                className="secondary cv-analysis-upload-btn"
                disabled={loading || uploadBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadBusy ? cv.uploadParsing : cv.uploadButton}
              </button>
              <span className="cv-analysis-upload-meta">{cv.uploadLabel}</span>
            </div>
            <p className="cv-analysis-hint cv-analysis-hint--upload">{cv.uploadHint}</p>
            <div
              className={`cv-analysis-drop-zone${dropActive ? ' cv-analysis-drop-zone--active' : ''}${loading || uploadBusy ? ' cv-analysis-drop-zone--disabled' : ''}`}
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
              disabled={loading}
              spellCheck
            />
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
              {cvPdfPreviewDataUrl ? (
                <div className="cv-analysis-preview-image-wrap">
                  <img
                    src={cvPdfPreviewDataUrl}
                    alt={cv.cvPreviewImageAlt}
                    className="cv-analysis-preview-image"
                    decoding="async"
                  />
                </div>
              ) : null}
              {cvText.trim().length > 0 ? (
                <div
                  className={
                    cvPdfPreviewDataUrl
                      ? 'cv-analysis-preview-body cv-analysis-preview-body--below-image'
                      : 'cv-analysis-preview-body'
                  }
                >
                  {cvText}
                </div>
              ) : cvPdfPreviewDataUrl ? null : (
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
            disabled={loading}
            autoComplete="url"
          />
          <button
            type="button"
            className="secondary"
            disabled={!canOpenJobLink || loading}
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
          disabled={loading}
          spellCheck
        />

        <div className="cv-analysis-actions">
          <button type="button" onClick={() => void analyze()} disabled={!canAnalyze}>
            {loading ? cv.analyzing : cv.analyze}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={clearAll}
            disabled={
              loading ||
              (cvText.trim().length === 0 &&
                jobUrlTrim.length === 0 &&
                jobText.trim().length === 0 &&
                !result &&
                !streaming)
            }
          >
            {cv.reset}
          </button>
        </div>

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
    </div>
  )
}
