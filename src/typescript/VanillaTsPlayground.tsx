import type { SandpackFiles } from '@codesandbox/sandpack-react'
import FrameworkSandpackCard from '../components/FrameworkSandpackCard'

const VANILLA_TS_LESSON_FILES = {
  '/index.ts': {
    code: `type Success<T> = { ok: true; value: T };
type Failure = { ok: false; error: string };
type Result<T> = Success<T> | Failure;

function unwrap<T>(r: Result<T>): string {
  if (!r.ok) return \`Error: \${r.error}\`;
  return \`Got: \${JSON.stringify(r.value)}\`;
}

const okNum: Result<number> = { ok: true, value: 42 };
const bad: Result<number> = { ok: false, error: 'offline' };

const root = document.getElementById('root');
if (root) {
  root.innerHTML = [unwrap(okNum), unwrap(bad)].map((s) => \`<p>\${s}</p>\`).join('');
}
`,
  },
} satisfies SandpackFiles

export default function VanillaTsPlayground() {
  return (
    <FrameworkSandpackCard
      template="vanilla-ts"
      title="Vanilla TypeScript playground"
      description="Edit the file below — discriminated Result&lt;T&gt; unwrap runs in the preview. Try adding a new variant or generic constraint."
      files={VANILLA_TS_LESSON_FILES}
      visibleFiles={['/index.ts']}
      activeFile="/index.ts"
      editorMinHeight={300}
      fallbackCode={VANILLA_TS_LESSON_FILES['/index.ts'].code}
      fallbackLanguage="typescript"
    />
  )
}
