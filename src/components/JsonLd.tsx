/**
 * Emits a JSON-LD block. Server-only by design so structured data lands in the
 * initial HTML, where crawlers and AI agents read it without running scripts.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own catalog data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
