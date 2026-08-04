import TypeScriptHubPage from '@/typescript/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'TypeScript Interview Questions',
  description:
    'TypeScript interview practice covering generics, utility types, narrowing and type-level patterns, with runnable examples in the browser.',
  path: '/typescript',
})

export default function Page() {
  return <TypeScriptHubPage />
}
