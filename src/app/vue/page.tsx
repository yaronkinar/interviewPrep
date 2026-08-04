import VueHubPage from '@/vue/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Vue.js Interview Questions',
  description:
    'Vue.js interview practice covering reactivity, the composition API, components and lifecycle hooks, with runnable examples in the browser.',
  path: '/vue',
})

export default function Page() {
  return <VueHubPage />
}
