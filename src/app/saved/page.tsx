import SavedQuestions from './SavedQuestions'
import { buildMetadata } from '@/lib/seo'

// Per-user content — useful to the signed-in reader, worthless in a search index.
export const metadata = buildMetadata({
  title: 'Saved Questions',
  description: 'The interview questions you have bookmarked.',
  path: '/saved',
  noIndex: true,
})

export default function Page() {
  return <SavedQuestions />
}
