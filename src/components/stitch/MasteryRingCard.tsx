type Props = {
  pct: number
  title: string
  subtitle: string
}

export default function MasteryRingCard({ pct, title, subtitle }: Props) {
  const clamped = Math.min(100, Math.max(0, Math.round(pct)))

  return (
    <div
      className="react-patterns-mastery-card"
      role="img"
      aria-label={`${title}. ${subtitle}. ${clamped} percent.`}
    >
      <div className="react-patterns-mastery-ring-wrap" aria-hidden>
        <svg className="react-patterns-mastery-svg" viewBox="0 0 36 36">
          <path
            className="react-patterns-mastery-track"
            fill="none"
            strokeWidth="3"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="react-patterns-mastery-fill"
            fill="none"
            strokeLinecap="round"
            strokeWidth="3"
            strokeDasharray={`${clamped}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="react-patterns-mastery-pct">{clamped}%</span>
      </div>
      <div className="react-patterns-mastery-copy">
        <p className="react-patterns-mastery-title">{title}</p>
        <p className="react-patterns-mastery-sub">{subtitle}</p>
      </div>
    </div>
  )
}
