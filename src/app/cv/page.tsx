import CvAnalysisPage from '@/questions/CvAnalysisPage'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'CV & Resume Analysis for Developers',
  description:
    'Upload your developer CV and get an AI review: scored dimensions, concrete next steps and a self-introduction you can use in interviews.',
  path: '/cv',
})

export default function Page() {
  return <CvAnalysisPage />
}
