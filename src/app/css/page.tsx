import CssPage from '@/css/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'CSS Interview Questions',
  description:
    'CSS interview practice with live demos: the box model, specificity, positioning, stacking contexts, margin collapse, centering a div and text truncation.',
  path: '/css',
})

export default function Page() {
  return <CssPage />
}
