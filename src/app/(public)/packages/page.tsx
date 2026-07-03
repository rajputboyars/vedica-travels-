import type { Metadata } from 'next'
import PackagesListClient from '@/features/packages/components/PackagesListClient'

export const metadata: Metadata = {
  title: 'Packages',
  description: 'Browse spiritual, holiday, weekend, family, honeymoon, group and corporate travel packages — customized itineraries with transparent pricing.',
  openGraph: { title: 'Packages', description: 'Browse spiritual, holiday, weekend, family, honeymoon, group and corporate travel packages.' },
}

// Phase 11 SEO — thin Server Component wrapper so this route can export
// metadata; all interactive filtering/fetching lives in
// PackagesListClient (a 'use client' component, which cannot export
// metadata itself).
export default function PackagesPage() {
  return <PackagesListClient />
}
