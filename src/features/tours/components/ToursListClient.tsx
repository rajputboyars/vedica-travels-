'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Compass } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import LuxTourCard from '@/features/home/components/LuxTourCard'
import Reveal from '@/features/home/components/Reveal'
import CategoryTabs, { type CategoryFilter } from '@/features/tours/components/CategoryTabs'
import PageHero from '@/components/lux/PageHero'
import EmptyState from '@/components/lux/EmptyState'
import type { Tour } from '@/types'

// Phase 11 SEO — the interactive (category-filter, client-fetch) part of
// /tours was extracted out of page.tsx so page.tsx can go back to being a
// plain Server Component that exports generateMetadata/metadata.
export default function ToursListClient() {
  return (
    <Suspense fallback={<div className="lux min-h-screen text-center py-40 text-white/40">Loading trips…</div>}>
      <ToursInner />
    </Suspense>
  )
}

function ToursInner() {
  const params = useSearchParams()
  const initial = (params.get('cat') as CategoryFilter) || 'all'
  const { data: tours, loading } = useFetch<Tour[]>('/api/tours', [])
  const [cat, setCat] = useState<CategoryFilter>(['spiritual', 'leisure'].includes(initial) ? initial : 'all')

  const visible = tours.filter((t) => cat === 'all' || (t.category || 'spiritual') === cat)
  const upcoming = visible.filter((t) => t.status === 'upcoming' || t.status === 'ongoing')
  const past = visible.filter((t) => t.status === 'completed')

  return (
    <div className="lux">
      <PageHero
        eyebrow="Handpicked journeys"
        title="Explore our"
        highlight="trips"
        description="Spiritual yatras & holiday getaways — curated for comfort and devotion."
        crumbs={[{ label: 'Tours' }]}
      />

      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <CategoryTabs value={cat} onChange={setCat} />

          {loading ? (
            <div className="text-center py-24 text-white/40">Loading trips…</div>
          ) : (
            <>
              {upcoming.length === 0 ? (
                <EmptyState icon={Compass} title="No trips in this category yet" description="New departures are added regularly — check back shortly!" action={{ label: 'View all packages', href: '/packages' }} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-16">
                  {upcoming.map((tour, i) => (
                    <Reveal key={tour._id} delay={(i % 3) * 60}><LuxTourCard tour={tour} /></Reveal>
                  ))}
                </div>
              )}

              {past.length > 0 && (
                <>
                  <h2 className="mb-8 font-display text-2xl font-semibold text-white flex items-center gap-2">
                    <span className="h-px w-6 bg-gilt-500/50" /> Completed Trips
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 opacity-75">
                    {past.map((tour, i) => (
                      <Reveal key={tour._id} delay={(i % 3) * 60}><LuxTourCard tour={tour} /></Reveal>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
