'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFetch } from '@/hooks/use-fetch'
import PackageCard from '@/features/packages/components/PackageCard'
import PackageCategoryTabs, { type PackageCategoryFilter } from '@/features/packages/components/PackageCategoryTabs'
import { packageCategoryOrder } from '@/config/package-theme'
import type { Package } from '@/types'

// Phase 11 SEO — the interactive (category-filter, client-fetch) part of
// /packages was extracted out of page.tsx so page.tsx can go back to
// being a plain Server Component that exports metadata. A 'use client'
// page file cannot export metadata, so the split is required, not
// cosmetic — see (public)/packages/page.tsx.
//
// Public listing — the GET /api/packages route already restricts
// anonymous requests to published, non-archived packages (see
// app/api/packages/route.ts), so this component never needs to filter
// that out client-side.
export default function PackagesListClient() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading packages...</div>}>
      <PackagesInner />
    </Suspense>
  )
}

function PackagesInner() {
  const params = useSearchParams()
  const initial = (params.get('cat') as PackageCategoryFilter) || 'all'
  const { data: packages, loading } = useFetch<Package[]>('/api/packages', [])
  const [cat, setCat] = useState<PackageCategoryFilter>(
    (packageCategoryOrder as string[]).includes(initial) ? initial : 'all'
  )

  const visible = packages.filter((p) => cat === 'all' || p.category === cat)

  return (
    <div className="min-h-screen">
      <div className="relative text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-orange-600 to-amber-500" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Explore Our Packages</h1>
          <p className="text-orange-100 text-lg">Spiritual, holiday, weekend, family & corporate trips — pick your journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <PackageCategoryTabs value={cat} onChange={setCat} />

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading packages...</div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
            <p className="text-lg">No packages in this category yet. Check back shortly!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((pkg) => <PackageCard key={pkg._id} pkg={pkg} />)}
          </div>
        )}
      </div>
    </div>
  )
}
