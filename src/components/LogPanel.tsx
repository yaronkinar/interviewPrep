import { useEffect, useRef } from 'react'

export type LogType = 'hit' | 'miss' | 'fire' | 'skip' | 'info' | 'ret' | 'error' | 'warn' | 'log' | 'sep'
export interface LogEntry { text: string; type: LogType }

interface Props { entries: LogEntry[] }

export default function LogPanel({ entries }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [entries])

  return (
    <div ref={ref} className="log">
      {entries.map((e, i) =>
        <div key={i} className={`log-entry ${e.type}`}>{e.text}</div>
      )}
    </div>
  )
}
