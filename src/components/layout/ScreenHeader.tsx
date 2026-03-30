type ScreenHeaderProps = {
  title: string
  lead?: string
  align?: 'center' | 'start'
}

export default function ScreenHeader({ title, lead, align = 'center' }: ScreenHeaderProps) {
  return (
    <header className={`screen-header screen-header--${align}`}>
      <h1 className="page-title">{title}</h1>
      {lead && <p className="screen-lead">{lead}</p>}
    </header>
  )
}
