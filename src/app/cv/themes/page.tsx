import CvThemeGeneratorPage from '@/questions/CvThemeGeneratorPage'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'CV Theme Generator',
  description:
    'Generate a polished, recruiter-friendly CV theme for your developer resume and export it ready to send.',
  path: '/cv/themes',
})

export default function Page() {
  return <CvThemeGeneratorPage />
}
