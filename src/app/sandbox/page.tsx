import ReactSandboxPage from '@/ReactSandboxPage'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'React Sandbox — Live Code Editor',
  description:
    'Write and run React code in the browser with a live preview — no setup, ideal for rehearsing live-coding interview rounds.',
  path: '/sandbox',
})

export default function Page() {
  return <ReactSandboxPage />
}
