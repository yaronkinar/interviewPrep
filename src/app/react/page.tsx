import ReactPage from '@/react/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'React Interview Questions & Hooks Patterns',
  description:
    'React interview practice with live demos: useRef, useCallback, custom hooks like useFetch and useDebounce, portals, the event loop and a React cheatsheet.',
  path: '/react',
})

export default function Page() {
  return <ReactPage />
}
