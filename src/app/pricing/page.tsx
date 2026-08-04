// src/app/pricing/page.tsx

import { auth } from '@clerk/nextjs/server'
import { getUserPlan } from '@/lib/repositories/subscriptions'
import PricingCards from './PricingCards'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Pricing',
  description:
    'Simple, honest pricing for Interview Prep — practise free, or unlock company filters, AI mock interviews and CV analysis.',
  path: '/pricing',
})

export default async function PricingPage() {
  const { userId } = await auth()
  const planInfo = userId ? await getUserPlan(userId) : { plan: 'free' as const }

  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-3">Simple, honest pricing</h1>
        <p className="text-center text-muted-foreground mb-12">
          Land the job or keep growing — there&apos;s a plan for both.
        </p>
        <PricingCards currentPlan={planInfo.plan} isSignedIn={Boolean(userId)} />
      </div>
    </main>
  )
}
