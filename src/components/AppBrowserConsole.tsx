import { useCallback, useEffect, useRef, useState } from 'react'

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'exception'

interface LogEntry {
  id: number
  t: number
  level: LogLevel
  message: string
}

const MAX = 300

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) {
        return `${a.name}: ${a.message}${a.stack ? `\n${a.stack}` : ''}`
      }
      try {
        if (typeof a === 'object' && a !== null) {
          return JSON.stringify(a, null, 0)
        }
      } catch {
        return String(a)
      }
      return String(a)
    })
    .join(' ')
}

let idSeq = 0

export default function AppBrowserConsole() {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<LogEntry[]>([])
  const listRef = useRef<HTMLDivElement>(null)

  const push = useCallback((level: LogLevel, args: unknown[]) => {
    const message = formatArgs(args)
    const entry: LogEntry = { id: ++idSeq, t: Date.now(), level, message }
    setEntries((prev) => {
      const next = [...prev, entry]
      return next.length > MAX ? next.slice(-MAX) : next
    })
  }, [])

  useEffect(() => {
    const orig = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    }

    console.log = (...a: unknown[]) => {
      push('log', a)
      orig.log(...a)
    }
    console.info = (...a: unknown[]) => {
      push('info', a)
      orig.info(...a)
    }
    console.warn = (...a: unknown[]) => {
      push('warn', a)
      orig.warn(...a)
    }
    console.error = (...a: unknown[]) => {
      push('error', a)
      orig.error(...a)
    }
    console.debug = (...a: unknown[]) => {
      push('debug', a)
      orig.debug(...a)
    }

    const onError = (ev: ErrorEvent) => {
      const msg = ev.message || 'Error'
      const where = ev.filename ? `${ev.filename}:${ev.lineno}:${ev.colno}` : ''
      push('exception', [msg, where, ev.error].filter(Boolean))
    }

    const onRejection = (ev: PromiseRejectionEvent) => {
      push('exception', ['Unhandled rejection', ev.reason])
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      console.log = orig.log
      console.info = orig.info
      console.warn = orig.warn
      console.error = orig.error
      console.debug = orig.debug
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [push])

  useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [entries, open])

  function clear() {
    setEntries([])
  }

  function copyAll() {
    const text = entries
      .map((e) => {
        const time = new Date(e.t).toISOString()
        return `[${time}] ${e.level.toUpperCase()} ${e.message}`
      })
      .join('\n')
    void navigator.clipboard.writeText(text)
  }

  return (
    <div className={`app-browser-console${open ? ' app-browser-console--open' : ''}`}>
      <button
        type="button"
        className="app-browser-console-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="app-browser-console-panel"
      >
        {open ? '▼ Hide console' : '▲ Browser console'}
        {entries.length > 0 && !open && (
          <span className="app-browser-console-badge">{entries.length}</span>
        )}
      </button>
      {open && (
        <div id="app-browser-console-panel" className="app-browser-console-panel" role="region" aria-label="Browser console">
          <div className="app-browser-console-toolbar">
            <span className="app-browser-console-title">Main window (log / warn / error)</span>
            <button type="button" className="secondary app-browser-console-tool" onClick={copyAll} disabled={entries.length === 0}>
              Copy all
            </button>
            <button type="button" className="secondary app-browser-console-tool" onClick={clear} disabled={entries.length === 0}>
              Clear
            </button>
          </div>
          <div ref={listRef} className="app-browser-console-list" tabIndex={0}>
            {entries.length === 0 ? (
              <div className="app-browser-console-empty">No messages yet. Logs from this tab appear here.</div>
            ) : (
              entries.map((e) => (
                <div key={e.id} className={`app-browser-console-line app-browser-console-line--${e.level}`}>
                  <span className="app-browser-console-time">
                    {new Date(e.t).toLocaleTimeString(undefined, { hour12: false })}
                  </span>
                  <span className="app-browser-console-level">{e.level}</span>
                  <pre className="app-browser-console-msg">{e.message}</pre>
                </div>
              ))
            )}
          </div>
          <p className="app-browser-console-footnote">
            Preview iframe logs stay in DevTools (F12) unless we wire postMessage. This panel is the app tab only.
          </p>
        </div>
      )}
    </div>
  )
}
