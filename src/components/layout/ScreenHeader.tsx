type ScreenHeaderProps = {
  title: string
  lead?: string
  /** Small label above the title (e.g. home hero chip) */
  kicker?: string
  align?: 'center' | 'start'
  className?: string
}

export default function ScreenHeader({ title, lead, kicker, align = 'center', className = '' }: ScreenHeaderProps) {
  return (
    <header className={`screen-header screen-header--${align}${className ? ` ${className}` : ''}`.trim()}>
      {kicker && <p className="screen-header-kicker">{kicker}</p>}
      <h1 className="page-title">{title}</h1>
      {lead && <p className="screen-lead">{lead}</p>}
    </header>
  )
}
