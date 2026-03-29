import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

function resolveSiteUrl(mode: string): string {
  const env = loadEnv(mode, process.cwd(), '')
  const fromVite = env.VITE_SITE_URL?.trim().replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  const fromVercel = vercel ? `https://${vercel.replace(/^https?:\/\//, '')}` : ''
  return fromVite || fromVercel || 'http://localhost:5173'
}

function seoPlugin(siteUrl: string): Plugin {
  return {
    name: 'seo-site-url-and-dist-files',
    transformIndexHtml(html) {
      return html.replace(/%SITE_URL%/g, siteUrl)
    },
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist')
      const base = siteUrl.replace(/\/$/, '')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
      const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`
      try {
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8')
        fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf8')
      } catch {
        /* dist missing in unusual build modes */
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const siteUrl = resolveSiteUrl(mode)
  return {
    plugins: [react(), seoPlugin(siteUrl)],
  }
})
