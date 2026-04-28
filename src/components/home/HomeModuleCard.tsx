import Link from 'next/link'

type HomeModuleCardProps = {
  title: string
  body: string
  cta: string
  to: string
  progressLine?: string | null
}

export default function HomeModuleCard({ title, body, cta, to, progressLine }: HomeModuleCardProps) {
  return (
    <article className="home-card card">
      <h3 className="card-title">{title}</h3>
      <p className="home-card-body">{body}</p>
      {progressLine ? <p className="home-card-progress">{progressLine}</p> : null}
      <Link className="home-card-link" href={to}>
        {cta} →
      </Link>
    </article>
  )
}
