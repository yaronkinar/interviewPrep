import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Editor, { type BeforeMount } from '@monaco-editor/react'
import GameBoard from './GameBoard'
import { runCode } from './GameRunner'
import { QUEST_LEVELS } from './levels'
import LevelPicker from './LevelPicker'
import ObjectivePanel from './ObjectivePanel'
import { loadProgress, markCompleted } from './progress'
import type { Level, RunResult } from './types'

const HERO_DTS = `
type Direction = 'north' | 'south' | 'east' | 'west'
type Item = { id: string; kind: 'gem' | 'key' | 'potion' | 'scroll'; x: number; y: number; taken: boolean }
type Enemy = { id: string; kind: string; type: string; x: number; y: number; hp: number; alive: boolean }
declare const hero: {
  readonly pos: { x: number; y: number }
  readonly hp: number
  readonly inventory: ReadonlyArray<Item>
  move(dir: Direction): boolean
  moveAsync(dir: Direction): Promise<boolean>
  attack(target: Enemy | string): void
  collect(): Item | null
  wait(ms: number): void
  say(msg: string): void
  scan(): { enemies: Enemy[]; items: Item[] }
  scout(dir: Direction): 'wall' | 'floor' | 'goal' | 'door' | 'lock' | 'enemy' | 'item'
  scoutAsync(dir: Direction): Promise<'wall' | 'floor' | 'goal' | 'door' | 'lock' | 'enemy' | 'item'>
  pickLock(): boolean
  onTurn(cb: (api: typeof hero) => void): void
  cast(spellName: string): void
  craft(...itemIds: string[]): Item | null
}
declare const enemies: ReadonlyArray<Enemy>
declare const items: ReadonlyArray<Item>
`

const beforeMount: BeforeMount = monaco => {
  monaco.editor.defineTheme('quest-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'c792ea', fontStyle: 'bold' },
      { token: 'string', foreground: 'c3e88d' },
      { token: 'number', foreground: 'f78c6c' },
      { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
      { token: 'type', foreground: '82aaff' },
    ],
    colors: {
      'editor.background': '#0a0c12',
      'editor.foreground': '#e2e8f0',
      'editor.lineHighlightBackground': '#1e2130',
      'editorLineNumber.foreground': '#2d3148',
      'editorLineNumber.activeForeground': '#64748b',
      'editorCursor.foreground': '#818cf8',
      focusBorder: '#818cf8',
    },
  })
  monaco.languages.typescript.javascriptDefaults.addExtraLib(HERO_DTS, 'quest-globals.d.ts')
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
  })
}

export default function QuestPage() {
  const [level, setLevel] = useState<Level>(QUEST_LEVELS[0])
  const [code, setCode] = useState<string>(QUEST_LEVELS[0].starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [conceptError, setConceptError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [completedIds, setCompletedIds] = useState<ReadonlyArray<string>>(() => loadProgress().completed)
  const [runKey, setRunKey] = useState(0)
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null)

  // When the player switches levels, swap the editor contents.
  useEffect(() => {
    setCode(level.starterCode)
    setResult(null)
    setConceptError(null)
    if (editorRef.current) editorRef.current.setValue(level.starterCode)
  }, [level])

  const isCompleted = useMemo(() => completedIds.includes(level.id), [completedIds, level.id])

  const handleRun = useCallback(async () => {
    if (running) return
    const source = editorRef.current?.getValue() ?? code
    setRunning(true)
    setConceptError(null)
    setResult(null)
    const conceptMsg = level.requireConcept ? level.requireConcept(source) : null
    const r = await runCode(source, level)
    setResult(r)
    setRunKey(k => k + 1)
    if (r.status === 'ok' && r.won && !conceptMsg) {
      const next = markCompleted(level.id)
      setCompletedIds(next.completed)
    } else if (r.status === 'ok' && r.won && conceptMsg) {
      setConceptError(conceptMsg)
    } else if (conceptMsg && r.status === 'ok') {
      setConceptError(conceptMsg)
    }
    setRunning(false)
  }, [code, level, running])

  const handleReset = useCallback(() => {
    setCode(level.starterCode)
    if (editorRef.current) editorRef.current.setValue(level.starterCode)
    setResult(null)
    setConceptError(null)
  }, [level])

  return (
    <div className="quest-page" dir="ltr">
      <header className="quest-page-header">
        <div>
          <h1 className="quest-page-title">JS Quest</h1>
          <p className="quest-page-lead">
            Write modern JavaScript to guide the hero. Each quest locks in a single concept — closures,
            async/await, higher-order functions, destructuring — and only completes when you use it.
          </p>
        </div>
      </header>

      <div className="quest-layout">
        <LevelPicker current={level} onSelect={setLevel} completedIds={completedIds} />

        <section className="quest-stage">
          <div className="quest-editor-wrap">
            <div className="quest-editor-header">
              <span className="quest-editor-title">{level.title}</span>
              <div className="quest-editor-actions">
                <button type="button" onClick={handleRun} disabled={running}>
                  {running ? '…' : '▶ Run'}
                </button>
                <button type="button" className="secondary" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
            <div className="quest-editor">
              <Editor
                defaultValue={level.starterCode}
                language="javascript"
                theme="quest-dark"
                beforeMount={beforeMount}
                onMount={editor => {
                  editorRef.current = editor
                  const monacoGlobal = (
                    window as { monaco?: { KeyMod: { CtrlCmd: number }; KeyCode: { Enter: number } } }
                  ).monaco
                  const keybinding = monacoGlobal
                    ? monacoGlobal.KeyMod.CtrlCmd | monacoGlobal.KeyCode.Enter
                    : 2097
                  editor.addCommand(keybinding, () => {
                    void handleRun()
                  })
                }}
                onChange={value => setCode(value ?? '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          <div className="quest-board-wrap">
            <GameBoard
              level={level}
              actions={result && result.status !== 'error' ? result.actions : null}
              runKey={runKey}
            />
          </div>
        </section>

        <ObjectivePanel
          level={level}
          result={result}
          conceptError={conceptError}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  )
}
