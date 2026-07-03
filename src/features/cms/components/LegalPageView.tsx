import type { LegalPage } from '@/types'

// Phase 10 CMS -- Terms/Privacy/Refund share one presentational shell
// since LegalPage is a single collection keyed by `type` with identical
// title+content shape (see types/cms.ts). Avoids three near-duplicate
// page bodies for /terms, /privacy-policy, /refund-policy.
export default function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold">{page.title}</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-orange max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
          {page.content}
        </div>
      </div>
    </div>
  )
}
