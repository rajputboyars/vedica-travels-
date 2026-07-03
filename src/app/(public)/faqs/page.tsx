import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { listFAQs, getSiteSettings } from '@/services/cms.service'

// Phase 11 caching -- FAQs change infrequently.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const description = `Frequently asked questions about booking, payments, and travel with ${settings.siteName}.`
  return {
    title: 'FAQs',
    description,
    openGraph: { title: 'FAQs', description },
  }
}

// Phase 10 CMS -- "FAQs": public published-only list, grouped by category,
// sourced from the FAQItem collection managed at /admin/cms/faqs. Also
// emits FAQPage JSON-LD so search engines can surface these as rich
// results (a Phase 11 concern too, but trivial to include now since the
// data is already in hand).
export default async function FAQsPage() {
  const faqs = await listFAQs({ publishedOnly: true })
  const groups = new Map<string, typeof faqs>()
  for (const faq of faqs) {
    const key = faq.category || 'General'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(faq)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-orange-100">Everything you need to know before you travel with us</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {faqs.length === 0 && <p className="text-center text-gray-500">No FAQs published yet.</p>}
        {Array.from(groups.entries()).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{category}</h2>
            <div className="space-y-3">
              {items.map((faq) => (
                <details key={faq._id} className="group bg-white border border-gray-200 rounded-xl p-4 open:shadow-sm">
                  <summary className="flex items-start gap-3 cursor-pointer list-none font-medium text-gray-800">
                    <HelpCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 pl-7">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
