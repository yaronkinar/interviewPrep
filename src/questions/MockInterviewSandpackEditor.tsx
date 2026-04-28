import { useEffect, useMemo, useRef } from 'react'
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { Question } from './data'
import { buildQuestionAmbientTypes, questionUsesReactSandpackPreview } from './mockCodeStarter'
import { mockInterviewSandpackAutocomplete } from './sandpackMockInterviewAutocomplete'
import { APP_WRAPPER } from './reactSandpackFiles'

const USER_ENTRY_TS = '/index.ts'
const USER_ENTRY_REACT = '/UserPreview.tsx'
const AMBIENT = '/interview-problem.d.ts'

function DraftSync({
  userEntry,
  codeDraft,
  onCodeChange,
}: {
  userEntry: string
  codeDraft: string
  onCodeChange: (v: string) => void
}) {
  const { sandpack } = useSandpack()
  const sandpackRef = useRef(sandpack)
  sandpackRef.current = sandpack

  const { code: active } = useActiveCode()
  const lastSynced = useRef(codeDraft)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Push parent draft into Sandpack when `codeDraft` changes — use a ref for `sandpack` so
  // re-renders from Sandpack don’t re-run this with a new `sandpack` identity and wipe edits.
  useEffect(() => {
    if (codeDraft === lastSynced.current) return
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    sandpackRef.current.updateFile(userEntry, codeDraft)
    lastSynced.current = codeDraft
  }, [codeDraft, userEntry])

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
  height = 'min(48vh, 500px)',
}: MockInterviewSandpackEditorProps) {
  const latestDraftRef = useRef(codeDraft)
  latestDraftRef.current = codeDraft

  const useReactPreview = questionUsesReactSandpackPreview(question)
  const userEntry = useReactPreview ? USER_ENTRY_REACT : USER_ENTRY_TS

  const initialFiles = useMemo(() => {
    const ambient = {
      [AMBIENT]: { code: buildQuestionAmbientTypes(question), hidden: true, readOnly: true },
    }
    if (useReactPreview) {
      return {
        ...ambient,
        [USER_ENTRY_REACT]: { code: latestDraftRef.current },
        '/App.tsx': { code: APP_WRAPPER, hidden: true },
      }
    }
    return {
      ...ambient,
      [USER_ENTRY_TS]: { code: latestDraftRef.current },
    }
  }, [question.id, useReactPreview])

  const codeMirrorExtensions = useMemo(() => mockInterviewSandpackAutocomplete(question), [question])

  const providerOptions = useReactPreview
    ? {
        activeFile: USER_ENTRY_REACT,
        visibleFiles: [USER_ENTRY_REACT],
        autorun: true,
        autoReload: true,
        recompileMode: 'delayed' as const,
        recompileDelay: 400,
        initMode: 'lazy' as const,
      }
    : {
        activeFile: USER_ENTRY_TS,
        visibleFiles: [USER_ENTRY_TS],
        autorun: true,
        autoReload: true,
        recompileMode: 'delayed' as const,
        recompileDelay: 400,
        initMode: 'lazy' as const,
      }

  return (
    <div
      className={
        useReactPreview ? 'mock-sandpack-editor mock-sandpack-editor--react' : 'mock-sandpack-editor'
      }
    >
      <SandpackProvider
        key={`${question.id}-${useReactPreview ? 'react' : 'ts'}`}
        template={useReactPreview ? 'react-ts' : 'vanilla-ts'}
        theme="dark"
        files={initialFiles}
        options={providerOptions}
      >
        <DraftSync userEntry={userEntry} codeDraft={codeDraft} onCodeChange={onCodeChange} />
        <SandpackLayout>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            style={{ height, minHeight: 240 }}
            extensions={codeMirrorExtensions}
          />
          {useReactPreview ? (
            <SandpackPreview showNavigator={false} showRefreshButton={false} style={{ minHeight: 280 }} />
          ) : null}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}
