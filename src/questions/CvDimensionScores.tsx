import type { CvDimensions } from './cvAnalysisScore'
import type { CvPageStrings } from '../i18n/strings'

export type CvDimensionScoresProps = {
  dimensions: CvDimensions
  cv: CvPageStrings
}

function DimBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="cv-analysis-dim">
      <div className="cv-analysis-dim-head">
        <span className="cv-analysis-dim-label">{label}</span>
        <span className="cv-analysis-dim-value">{value}</span>
      </div>
      <div className="cv-analysis-dim-track" role="presentation">
        <div className="cv-analysis-dim-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function CvDimensionScores({ dimensions, cv }: CvDimensionScoresProps) {
  return (
    <div className="cv-analysis-dimensions" aria-label={cv.dimensionsHeading}>
      <p className="cv-analysis-dimensions-heading">{cv.dimensionsHeading}</p>
      <div className="cv-analysis-dimensions-grid">
        <DimBar label={cv.dimAts} value={dimensions.ats} />
        <DimBar label={cv.dimFit} value={dimensions.fit} />
        <DimBar label={cv.dimClarity} value={dimensions.clarity} />
      </div>
    </div>
  )
}
