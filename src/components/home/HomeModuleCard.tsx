import { Link } from 'react-router-dom'

type HomeModuleCardProps = {
  title: string
  body: string
  cta: string
  to: string
}

export default function HomeModuleCard({ title, body, cta, to }: HomeModuleCardProps) {
  return (
    <article className="home-card card">
      <h3 className="card-title">{title}</h3>
      <p className="home-card-body">{body}</p>
      <Link className="home-card-link" to={to}>
        {cta} →
      </Link>
    </article>
  )
}
