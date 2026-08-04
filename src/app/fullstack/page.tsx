import FullStackHubPage from '@/fullstack/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Full Stack Interview Questions',
  description:
    'Full stack interview practice covering APIs, databases, system design and back-end fundamentals alongside front-end patterns.',
  path: '/fullstack',
})

export default function Page() {
  return <FullStackHubPage />
}
