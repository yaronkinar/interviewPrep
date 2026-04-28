import { useRef, useState } from 'react'
import {
  SandpackConsole,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import { useLocale } from '../i18n/LocaleContext'
import { getUiStrings } from '../i18n/uiStrings'
import { SANDBOX_INDEX_CODE, SANDBOX_UTILS_CODE } from './sandboxSandpackFiles'

function SandpackActions({
  onResetAll,
  onClearConsole,
  runLabel,
  clearLabel,
  resetLabel,
}: {
  onResetAll: () => void
  onClearConsole: () => void
  runLabel: string
  clearLabel: string
  resetLabel: string
}) {
  const { sandpack } = useSandpack()

  return (
    <div className="sandbox-actions">
      <button type="button" onClick={() => void sandpack.runSandpack()}>
        ▶ {runLabel}
      </button>
      <button type="button" className="secondary" onClick={onClearConsole}>
        {clearLabel}
      </button>
      <button type="button" className="secondary" onClick={onResetAll}>
        {resetLabel}
      </button>
    </div>
  )
}

export default function SandboxSandpack() {
  const { locale } = useLocale()
  const ui = getUiStrings(locale)
  const [instanceKey, setInstanceKey] = useState(0)
  const consoleRef = useRef<{ reset: () => void } | null>(null)

  const files = {
    '/sandbox-utils.js': { code: SANDBOX_UTILS_CODE, hidden: true },
    '/index.js': { code: SANDBOX_INDEX_CODE },
  }

  return (
    <div className="card sandbox-wrap sandbox-sandpack" style={{ marginTop: 0 }}>
      <SandpackProvider
        key={instanceKey}
        template="vanilla"
        theme="dark"
        files={files}
        options={{
          visibleFiles: ['/index.js'],
          activeFile: '/index.js',
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 400,
          initMode: 'lazy',
        }}
      >
        <div className="sandbox-header">
          <div className="sandbox-header-left">
            <span className="card-title">{ui.js.sandbox.title}</span>
            <span className="sandbox-hint">{ui.js.sandbox.hint}</span>
          </div>
          <SandpackActions
            runLabel={ui.js.sandbox.runButton}
            clearLabel={ui.js.sandbox.clearOutput}
            resetLabel={ui.js.sandbox.reset}
            onClearConsole={() => consoleRef.current?.reset()}
            onResetAll={() => setInstanceKey(k => k + 1)}
          />
        </div>
        <p className="card-desc">{ui.js.sandbox.description}</p>

        <div className="sandbox-body sandbox-body--sandpack">
          <SandpackLayout>
            <SandpackCodeEditor showLineNumbers style={{ height: 320, minWidth: 0 }} showTabs={false} />
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 0, minWidth: 0 }}>
              <SandpackPreview
                showNavigator={false}
                style={{ flex: 1, minHeight: 140, maxHeight: 220 }}
                showRefreshButton={false}
              />
              <SandpackConsole
                ref={consoleRef}
                showHeader={false}
                showResetConsoleButton
                style={{ flex: 1, minHeight: 120, maxHeight: 220 }}
              />
            </div>
          </SandpackLayout>
        </div>
      </SandpackProvider>
    </div>
  )
}
