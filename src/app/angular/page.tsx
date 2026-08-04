import AngularHubPage from '@/angular/index'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Angular Interview Questions',
  description:
    'Angular interview practice covering components, dependency injection, RxJS and change detection, with runnable examples in the browser.',
  path: '/angular',
})

export default function Page() {
  return <AngularHubPage />
}
