import { useEffect, useMemo, useRef } from 'react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { Question } from './data'
import { buildQuestionAmbientTypes } from './mockCodeStarter'
import { mockInterviewSandpackAutocomplete } from './sandpackMockInterviewAutocomplete'

const USER_ENTRY = '/index.ts'
const AMBIENT = '/interview-problem.d.ts'

function DraftSync({
  codeDraft,
  onCodeChange,
}: {
  codeDraft: string
  onCodeChange: (v: string) => void
}) {
  const { sandpack } = useSandpack()
  const { code: active } = useActiveCode()
  const lastSynced = useRef(codeDraft)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (codeDraft === lastSynced.current) return
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    sandpack.updateFile(USER_ENTRY, codeDraft)
    lastSynced.current = codeDraft
  }, [codeDraft, sandpack])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      if (active === lastSynced.current) return
      onCodeChange(active)
      lastSynced.current = active
    }, 350)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [active, onCodeChange])

  return null
}

export interface MockInterviewSandpackEditorProps {
  question: Question
  codeDraft: string
  onCodeChange: (v: string) => void
  /** CSS height for the editor surface */
  height?: string
}

export default function MockInterviewSandpackEditor({
  question,
  codeDraft,
  onCodeChange,
  height = 'min(42vh, 360px)',
}: MockInterviewSandpackEditorProps) {
  const latestDraftRef = useRef(codeDraft)
  latestDraftRef.current = codeDraft

  const initialFiles = useMemo(
    () => ({
      [AMBIENT]: { code: buildQuestionAmbientTypes(question), hidden: true, readOnly: true },
      [USER_ENTRY]: { code: latestDraftRef.current },
    }),
    [question.id],
  )

  const codeMirrorExtensions = useMemo(() => mockInterviewSandpackAutocomplete(question), [question])

  return (
    <div className="mock-sandpack-editor">
      <SandpackProvider
        key={question.id}
        template="vanilla-ts"
        theme="dark"
        files={initialFiles}
        options={{
          activeFile: USER_ENTRY,
          visibleFiles: [USER_ENTRY],
          autorun: true,
          autoReload: true,
          recompileMode: 'delayed',
          recompileDelay: 400,
          initMode: 'lazy',
        }}
      >
        <DraftSync codeDraft={codeDraft} onCodeChange={onCodeChange} />
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            style={{ height, minHeight: 240 }}
            extensions={codeMirrorExtensions}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
