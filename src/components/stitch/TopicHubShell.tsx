import type { ReactNode } from 'react'

export type TopicHubShellProps = {
  title: string
  lead?: string
  /** Small uppercase-style label above title */
  kicker?: string
  /** Right column on wide screens (e.g. JS hub action buttons) */
  heroExtra?: ReactNode
  children: ReactNode
}

/**
 * Shared layout for JS / React / TypeScript / Vue / Angular / CSS / Full stack topic hubs,
 * aligned with Stitch category-detail density (screens 08 / 11).
 */
export default function TopicHubShell({ title, lead, kicker, heroExtra, children }: TopicHubShellProps) {
  return (
    <div className="topic-hub-page editorial-page">
      <div className="topic-hub-inner">
        <header className={`topic-hub-hero${heroExtra ? ' topic-hub-hero--split' : ''}`}>
          <div className="topic-hub-hero-main">
            {kicker ? <p className="topic-hub-kicker">{kicker}</p> : null}
            <h1 className="topic-hub-title">{title}</h1>
            {lead ? <p className="topic-hub-lead">{lead}</p> : null}
          </div>
          {heroExtra ? <div className="topic-hub-hero-extra">{heroExtra}</div> : null}
        </header>
        <div className="topic-hub-body">{children}</div>
      </div>
    </div>
  )
}
