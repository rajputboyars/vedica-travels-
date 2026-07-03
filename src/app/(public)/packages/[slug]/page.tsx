import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, Phone, MessageCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { getPackageBySlug } from '@/services/package.service'
import { getSeatAvailability } from '@/services/registration.service'
import { packageCategoryMeta } from '@/config/package-theme'
import { siteConfig, phoneHref } from '@/config/site'

interface PageProps { params: Promise<{ slug: string }> }

// Phase 11 caching -- short revalidate rather than the homepage's 60s:
// this page shows live seat availability, which changes every time
// someone registers, so a short ISR window balances DB load against
// showing stale "seats left" counts to a customer deciding whether to
// book (the actual booking API still re-checks seats server-side either
// way, so staleness here is a UX concern, not a correctness one).
export const revalidate = 30

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Package not found' }
  const description = pkg.metaDescription || pkg.description.slice(0, 160)
  // An admin-set metaTitle is a deliberate full SEO-title override, so it
  // bypasses the root layout's " | <siteName>" template (`absolute`); the
  // fallback (package title) still goes through the template normally.
  return {
    title: pkg.metaTitle ? { absolute: pkg.metaTitle } : pkg.title,
    description,
    openGraph: {
      title: pkg.metaTitle || pkg.title,
      description,
      images: pkg.images?.[0] ? [{ url: pkg.images[0] }] : undefined,
      type: 'website',
    },
  }
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  const meta = packageCategoryMeta[pkg.category]
  const availability = await getSeatAvailability(pkg._id)

  // Phase 11 SEO — TouristTrip/Product-style JSON-LD so search engines can
  // show price/availability rich results for package detail pages.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: pkg.title,
    description: pkg.description,
    image: pkg.images?.length ? pkg.images : undefined,
    offers: {
      '@type': 'Offer',
      price: pkg.price,
      priceCurrency: 'INR',
      availability: availability.available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <div className="relative text-white py-16 px-4 overflow-hidden">
        {/* Phase 11 — next/image now works for admin-supplied URLs on any
            host (see next.config.ts's wildcard remotePattern), so this no
            longer needs the plain-<img> workaround. */}
        {pkg.images?.[0]
          ? <Image src={pkg.images[0]} alt={pkg.title} fill priority sizes="100vw" className="object-cover" />
          : <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-500" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/30" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex gap-2 mb-3">
            <Badge className={`border-white/30 text-white ${meta.badgeClass}`}>{meta.emoji} {meta.label}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow">{pkg.title}</h1>
          {pkg.shortDescription && <p className="text-orange-100">{pkg.shortDescription}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Package Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: <Calendar size={16} className="text-orange-600" />, label: 'Duration', value: `${pkg.duration.days} Days / ${pkg.duration.nights} Nights` },
                { icon: <Users size={16} className="text-orange-600" />, label: 'Seats Available', value: `${availability.available} of ${availability.totalSeats}` },
                { icon: <Clock size={16} className="text-orange-600" />, label: 'Category', value: meta.label },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-gray-500 text-xs">{item.label}</div>
                    <div className="font-medium text-gray-800">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {pkg.description && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-3">About this Package</h2>
              <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
            </div>
          )}

          {pkg.itinerary.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Itinerary</h2>
              <div className="space-y-4">
                {pkg.itinerary.map((day, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                      D{day.day}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{day.title}</div>
                      {day.description && <div className="text-sm text-gray-500">{day.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pkg.includedServices.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">What&apos;s Included</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pkg.includedServices.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pkg.excludedServices.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Not Included</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pkg.excludedServices.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <XCircle size={16} className="text-red-400 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pkg.pickupPoints.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Pickup Points</h2>
              <ul className="space-y-2">
                {pkg.pickupPoints.map((pp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-orange-500 shrink-0" />{pp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pkg.faqs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {pkg.faqs.map((f, i) => (
                  <div key={i} className="flex gap-3">
                    <HelpCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{f.question}</div>
                      <div className="text-sm text-gray-500">{f.answer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
            <div className="text-3xl font-bold text-orange-600 mb-1">₹{pkg.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">per person</div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Users size={14} />
              {availability.available > 0 ? `${availability.available} seats left` : 'Fully booked — waiting list open'}
            </div>

            <Link href={`/packages/${pkg.slug}/register`}>
              <Button className="w-full">{availability.available > 0 ? 'Register Now' : 'Join Waiting List'}</Button>
            </Link>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {availability.available > 0
                ? 'No online payment — pay by QR after registering.'
                : "This package is full — you'll be registered on the waiting list and notified the moment a seat opens up."}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <a href={phoneHref(siteConfig.contact.primaryPhone)} className="flex items-center justify-center gap-2 w-full py-2.5 border border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
                <Phone size={15} /> Call: {siteConfig.contact.primaryPhone}
              </a>
              <a href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
