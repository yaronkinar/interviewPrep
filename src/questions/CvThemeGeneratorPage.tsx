import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import ScreenHeader from '../components/layout/ScreenHeader'
import { useLocale } from '../i18n/LocaleContext'
import type { CvThemePageStrings } from '../i18n/strings'
import { isRtlLocale } from '../i18n/locale'
import { PATH_FOR_PAGE } from '../routes'
import { CV_WORD_TEMPLATE_PATH } from './cvTemplateAsset'
import {
  CV_THEME_PRESETS,
  findCvThemePreset,
  type CvThemePresetId,
} from './cvThemePresets'
import { canvasStyleFromPreset, renderCvPlainTextToDataUrl } from './cvTextPreviewImage'

const SAMPLE_CV = `Alex Rivera
Product designer · alex@example.com · +1 555 0100 · City, Country

Summary
Product designer with 8+ years shipping B2B SaaS. Strong systems thinking, research-to-launch workflows, and cross-functional leadership.

SKILLS
Frontend: React • TypeScript • CSS
Tools: Figma · Storybook

WORK HISTORY
Acme Corp    03/2021 – 02/2024
Senior Product Designer
- Led design system adoption across 6 squads; cut UI debt backlog by 40%.
- Partnered with PM and eng on roadmap discovery for analytics suite.

Beta Labs    2016 – 2021
Product Designer
- Shipped onboarding redesign; activation +12% in first cohort.

EDUCATION
BFA Industrial Design — State University (2012)

ACCOMPLISHMENTS
- Hackathon winner
- Speaker at local meetups`

function presetLabel(t: CvThemePageStrings, id: CvThemePresetId): string {
  switch (id) {
    case 'editorial':
      return t.presetEditorial
    case 'noir':
      return t.presetNoir
    case 'ocean':
      return t.presetOcean
    case 'parchment':
      return t.presetParchment
    case 'mono':
      return t.presetMono
    case 'rose':
      return t.presetRose
    default:
      return id
  }
}

export default function CvThemeGeneratorPage() {
  const { locale, strings } = useLocale()
  const t = strings.cvThemePage
  const cv = strings.cvPage
  const contentDir = isRtlLocale(locale) ? 'rtl' : 'ltr'
  const [cvText, setCvText] = useState(SAMPLE_CV)
  const [presetId, setPresetId] = useState<CvThemePresetId>('editorial')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [docxBusy, setDocxBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const exportBusy = docxBusy || pdfBusy
  const fileInputRef = useRef<HTMLInputElement>(null)

  const style = useMemo(() => canvasStyleFromPreset(findCvThemePreset(presetId)), [presetId])

  const previewUrl = useMemo(
    () => renderCvPlainTextToDataUrl(cvText, style),
    [cvText, style],
  )

  const downloadPng = useCallback(() => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `cv-preview-${presetId}.png`
    a.rel = 'noopener'
    a.click()
  }, [previewUrl, presetId])

  const downloadDocx = useCallback(async () => {
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

  const downloadPdf = useCallback(async () => {
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

  async function processCvFile(file: File) {
    setUploadError(null)
    setUploadBusy(true)
    try {
      const { extractCvFileText } = await import('./extractCvFileText')
      const result = await extractCvFileText(file)
      if (result.ok) {
        setCvText(result.text)
      } else {
        const msg =
          result.code === 'too_large'
            ? cv.uploadTooLarge
            : result.code === 'unsupported'
              ? cv.uploadUnsupported
              : result.code === 'empty'
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

  return (
    <div className="editorial-page editorial-page--cv cv-theme-page" dir={contentDir}>
      <ScreenHeader title={t.title} lead={t.lead} align="start" />

      <p className="cv-theme-crossnav">
        <Link className="cv-theme-crossnav-link" to={PATH_FOR_PAGE.cv}>
          {t.backToAnalysis}
        </Link>
      </p>

      <section className="editorial-panel cv-theme-panel" aria-labelledby="cv-theme-form-heading">
        <h2 id="cv-theme-form-heading" className="cv-analysis-form-title">
          {t.sectionHeading}
        </h2>

        <p className="cv-analysis-label" id="cv-theme-presets-label">
          {t.themesHeading}
        </p>
        <div className="cv-theme-preset-row" role="group" aria-labelledby="cv-theme-presets-label">
          {CV_THEME_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`cv-theme-preset-btn${presetId === p.id ? ' cv-theme-preset-btn--active' : ''}`}
              onClick={() => setPresetId(p.id)}
              style={
                {
                  '--chip-bg': p.background,
                  '--chip-fg': p.text,
                  '--chip-accent': p.accent,
                } as CSSProperties
              }
            >
              {presetLabel(t, p.id)}
            </button>
          ))}
        </div>

        <p className="cv-analysis-hint cv-theme-docx-hint">{t.docxExportHint}</p>

        <p className="cv-theme-template-link-wrap">
          <a className="cv-theme-crossnav-link" href={CV_WORD_TEMPLATE_PATH} download="cv-template.docx">
            {t.downloadBlankTemplate}
          </a>
        </p>

        <div className="cv-analysis-upload-row cv-theme-upload-row">
          <input
            ref={fileInputRef}
            id="cv-theme-file"
            type="file"
            className="cv-analysis-file-input"
            accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => void onCvFileChange(e)}
            disabled={uploadBusy || exportBusy}
            aria-label={cv.uploadButton}
          />
          <button
            type="button"
            className="secondary cv-analysis-upload-btn"
            disabled={uploadBusy || exportBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadBusy ? cv.uploadParsing : cv.uploadButton}
          </button>
          <span className="cv-analysis-upload-meta">{cv.uploadLabel}</span>
        </div>
        {uploadError && <p className="q-chat-error cv-analysis-upload-error">{uploadError}</p>}

        <label className="cv-analysis-label" htmlFor="cv-theme-text">
          {t.cvLabel}
        </label>
        <textarea
          id="cv-theme-text"
          className="cv-analysis-textarea cv-analysis-textarea--cv-main"
          rows={14}
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder={t.cvPlaceholder}
          spellCheck
        />

        <div className="cv-theme-preview-block">
          <p className="cv-analysis-label">{t.previewHeading}</p>
          <div className="cv-analysis-preview-pane cv-theme-preview-pane">
            {previewUrl ? (
              <div className="cv-analysis-preview-image-wrap">
                <img
                  src={previewUrl}
                  alt={t.previewAlt}
                  className="cv-analysis-preview-image"
                  decoding="async"
                />
              </div>
            ) : (
              <p className="cv-analysis-preview-empty">{t.previewEmpty}</p>
            )}
          </div>
          <div className="cv-theme-actions">
            <button type="button" onClick={() => void downloadDocx()} disabled={!cvText.trim() || exportBusy}>
              {docxBusy ? t.docxWorking : t.downloadDocx}
            </button>
            <button type="button" onClick={() => void downloadPdf()} disabled={!cvText.trim() || exportBusy}>
              {pdfBusy ? t.pdfWorking : t.downloadPdf}
            </button>
            <button type="button" className="secondary" onClick={downloadPng} disabled={!previewUrl}>
              {t.downloadPng}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
