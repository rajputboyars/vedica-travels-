'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFetch } from '@/hooks/use-fetch'
import TourCard from '@/features/tours/components/TourCard'
import CategoryTabs, { type CategoryFilter } from '@/features/tours/components/CategoryTabs'
import type { Tour } from '@/types'

// Phase 11 SEO — the interactive (category-filter, client-fetch) part of
// /tours was extracted out of page.tsx so page.tsx can go back to being a
// plain Server Component that exports generateMetadata/metadata. A 'use
// client' page file cannot export metadata, so the split is required, not
// cosmetic — see (public)/tours/page.tsx.
export default function ToursListClient() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading trips...</div>}>
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
    <div className="min-h-screen">
      <div className="relative text-white py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-700 via-orange-600 to-amber-500" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Explore Our Trips</h1>
          <p className="text-orange-100 text-lg">Spiritual yatras & holiday getaways — handpicked for you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <CategoryTabs value={cat} onChange={setCat} />

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading trips...</div>
        ) : (
          <>
            {upcoming.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl mb-12">
                <p className="text-lg">No trips in this category yet. Check back shortly!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {upcoming.map((tour) => <TourCard key={tour._id} tour={tour} />)}
              </div>
            )}

            {past.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ Completed Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((tour) => <TourCard key={tour._id} tour={tour} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
