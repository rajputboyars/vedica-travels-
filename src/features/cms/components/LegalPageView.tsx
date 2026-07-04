import PageHero from '@/components/lux/PageHero'
import type { LegalPage } from '@/types'

// Phase 10 CMS -- Terms/Privacy/Refund share one presentational shell
// since LegalPage is a single collection keyed by `type` with identical
// title+content shape (see types/cms.ts).
export default function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <div className="lux">
      <PageHero compact title={page.title} crumbs={[{ label: page.title }]} />
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto rounded-3xl glass gilt-border p-8 sm:p-10">
          <div className="whitespace-pre-wrap leading-relaxed text-white/70">{page.content}</div>
        </div>
      </section>
    </div>
  )
}
