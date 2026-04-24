import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import ClientProviders from './ClientProviders'
import '@/index.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://interview-prep.vercel.app'

export const viewport: Viewport = {
  themeColor: '#0c1222',
}

export const metadata: Metadata = {
  title: 'Interview Prep',
  description:
    'Practice JavaScript patterns, React interview questions, company Q&A, and mock interviews with Claude — interview prep in the browser.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'Interview Prep',
    title: 'Interview Prep',
    description:
      'Practice JavaScript patterns, React interview questions, company Q&A, and mock interviews with Claude — interview prep in the browser.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary',
    title: 'Interview Prep',
    description:
      'Practice JavaScript patterns, React interview questions, company Q&A, and mock interviews with Claude — interview prep in the browser.',
  },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body suppressHydrationWarning>
          {/* Inline theme init to avoid flash of wrong theme */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('interview-prep-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;return}}catch(e){}if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.dataset.theme='light'}else{document.documentElement.dataset.theme='dark'}})()`,
            }}
          />
          <ClientProviders>{children}</ClientProviders>
        </body>
      </html>
    </ClerkProvider>
  )
}
