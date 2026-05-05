import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import ClientProviders from './ClientProviders'
import '@/index.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://interview-prep.vercel.app'

export const viewport: Viewport = {
  themeColor: '#f7f9fc',
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
    images: [
      {
        url: '/og-interview-prep-home.webp',
        width: 1200,
        height: 630,
        alt: 'Interview Prep — browser-based interview practice',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interview Prep',
    description:
      'Practice JavaScript patterns, React interview questions, company Q&A, and mock interviews with Claude — interview prep in the browser.',
    images: ['/og-interview-prep-home.webp'],
  },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body suppressHydrationWarning>
          <Script
            id="interview-prep-theme-init"
            strategy="beforeInteractive"
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
