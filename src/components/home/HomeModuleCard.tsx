import Image from 'next/image'
import Link from 'next/link'

type HomeModuleCardProps = {
  title: string
  body: string
  cta: string
  to: string
  illustrationSrc?: string
  progressLine?: string | null
}

export default function HomeModuleCard({
  title,
  body,
  cta,
  to,
  illustrationSrc,
  progressLine,
}: HomeModuleCardProps) {
  return (
    <article className="home-card card">
      {illustrationSrc ? (
        <div className="home-card-media" aria-hidden="true">
          <Image
            src={illustrationSrc}
            alt=""
            fill
            sizes="(max-width: 699px) min(92vw, 40rem), (max-width: 1100px) min(42vw, 24rem), 280px"
            className="home-card-media-img"
          />
        </div>
      ) : null}
      <h3 className="card-title">{title}</h3>
      <p className="home-card-body">{body}</p>
      {progressLine ? <p className="home-card-progress">{progressLine}</p> : null}
      <Link className="home-card-link" href={to}>
        {cta} →
      </Link>
    </article>
  )
}
