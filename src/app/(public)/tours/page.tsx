import type { Metadata } from 'next'
import ToursListClient from '@/features/tours/components/ToursListClient'

export const metadata: Metadata = {
  title: 'Trips',
  description: 'Explore upcoming spiritual yatras and holiday getaways — Khatu Shyam Ji, Vrindavan, Haridwar, Manali, Mussoorie, Rishikesh, Dehradun and more.',
  openGraph: { title: 'Trips', description: 'Explore upcoming spiritual yatras and holiday getaways.' },
}

// Phase 11 SEO — thin Server Component wrapper so this route can export
// metadata; all interactive filtering/fetching lives in ToursListClient
// (a 'use client' component, which cannot export metadata itself).
export default function ToursPage() {
  return <ToursListClient />
}
