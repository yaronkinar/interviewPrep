import QuestPage from '@/quest/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'JS Quest — Gamified JavaScript Practice',
  description:
    'Level up your JavaScript through a gamified quest: solve interview-style challenges in the browser and track your progress.',
  path: '/quest',
})

export default function Page() {
  return <QuestPage />
}
