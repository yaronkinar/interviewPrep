import type { CvNextStep } from './cvAnalysisScore'
import type { CvPageStrings } from '../i18n/strings'

export type CvNextStepsPanelProps = {
  steps: CvNextStep[]
  cv: CvPageStrings
}

function categoryLabel(cv: CvPageStrings, c: string | undefined): string | null {
  if (!c) return null
  const k = c.toLowerCase()
  if (k === 'ats') return cv.catAts
  if (k === 'fit') return cv.catFit
  if (k === 'content') return cv.catContent
  if (k === 'other') return cv.catOther
  return c
}

export default function CvNextStepsPanel({ steps, cv }: CvNextStepsPanelProps) {
  if (!steps.length) return null

  return (
    <section className="cv-analysis-next-steps" aria-labelledby="cv-next-steps-heading">
      <h3 id="cv-next-steps-heading" className="cv-analysis-next-steps-title">
        {cv.nextStepsHeading}
      </h3>
      <ol className="cv-analysis-next-steps-list">
        {steps.map((s, i) => {
          const chip = categoryLabel(cv, s.c)
          return (
            <li key={i} className="cv-analysis-next-step">
              <div className="cv-analysis-next-step-head">
                <span className="cv-analysis-next-step-title">{s.t}</span>
                {chip && <span className="cv-analysis-next-step-chip">{chip}</span>}
              </div>
              {s.d && <p className="cv-analysis-next-step-detail">{s.d}</p>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
