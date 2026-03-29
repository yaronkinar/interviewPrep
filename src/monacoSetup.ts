/**
 * Monaco’s TypeScript worker must load from the same bundle as the editor (Vite).
 * Without this, CDN workers often break and IntelliSense shows an empty suggest box.
 */
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

globalThis.MonacoEnvironment = {
  getWorker(_moduleId: string, label: string) {
    switch (label) {
      case 'typescript':
      case 'javascript':
        return new TsWorker()
      case 'editorWorkerService':
        return new EditorWorker()
      default:
        return new EditorWorker()
    }
  },
}

loader.config({ monaco })
