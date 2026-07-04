'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PackageOpen } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import LuxPackageCard from '@/features/packages/components/LuxPackageCard'
import Reveal from '@/features/home/components/Reveal'
import PackageCategoryTabs, { type PackageCategoryFilter } from '@/features/packages/components/PackageCategoryTabs'
import PageHero from '@/components/lux/PageHero'
import EmptyState from '@/components/lux/EmptyState'
import { packageCategoryOrder } from '@/config/package-theme'
import type { Package } from '@/types'

// Phase 11 SEO — interactive (category-filter, client-fetch) part of
// /packages, extracted so page.tsx stays a Server Component with metadata.
// Public listing — the GET /api/packages route already restricts anonymous
// requests to published, non-archived packages.
export default function PackagesListClient() {
  return (
    <Suspense fallback={<div className="lux min-h-screen text-center py-40 text-white/40">Loading packages…</div>}>
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
    <div className="lux">
      <PageHero
        eyebrow="Curated experiences"
        title="Explore our"
        highlight="packages"
        description="Spiritual, holiday, weekend, family & corporate journeys — pick the one that calls you."
        crumbs={[{ label: 'Packages' }]}
      />

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <PackageCategoryTabs value={cat} onChange={setCat} />

          {loading ? (
            <div className="text-center py-24 text-white/40">Loading packages…</div>
          ) : visible.length === 0 ? (
            <EmptyState icon={PackageOpen} title="No packages in this category yet" description="We're adding new journeys regularly — check back shortly!" action={{ label: 'Browse all tours', href: '/tours' }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {visible.map((pkg, i) => (
                <Reveal key={pkg._id} delay={(i % 3) * 60}><LuxPackageCard pkg={pkg} /></Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
