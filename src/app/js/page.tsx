import JsPage from '@/js/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'JavaScript Interview Questions & Patterns',
  description:
    'Practice the JavaScript patterns interviewers ask for: implement debounce, throttle, memoize, lazy loading and find vs filter, with runnable examples in the browser.',
  path: '/js',
})

export default function Page() {
  return <JsPage />
}
