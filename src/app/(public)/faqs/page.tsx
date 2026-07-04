import type { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import PageHero from '@/components/lux/PageHero'
import FaqAccordion from '@/features/home/components/FaqAccordion'
import Reveal from '@/features/home/components/Reveal'
import EmptyState from '@/components/lux/EmptyState'
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
// emits FAQPage JSON-LD so search engines can surface these as rich results.
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
    <div className="lux">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHero
        eyebrow="Good to know"
        title="Frequently asked"
        highlight="questions"
        description="Everything you need to know before you travel with us."
        crumbs={[{ label: 'FAQs' }]}
      />

      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {faqs.length === 0 && (
            <EmptyState icon={HelpCircle} title="No FAQs published yet" description="Check back soon — or reach out to us directly." action={{ label: 'Contact us', href: '/contact' }} />
          )}
          {Array.from(groups.entries()).map(([category, items]) => (
            <div key={category}>
              <Reveal>
                <h2 className="mb-5 font-display text-2xl font-semibold text-white flex items-center gap-2">
                  <span className="h-px w-6 bg-gilt-500/50" /> {category}
                </h2>
              </Reveal>
              <FaqAccordion items={items} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
