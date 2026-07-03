import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Phone, MessageCircle, CheckCircle2 } from 'lucide-react'
import BookingForm from '@/features/booking/components/BookingForm'
import { getTour } from '@/services/tour.service'
import { categoryMeta, resolveCategory } from '@/config/theme'
import { siteConfig, phoneHref } from '@/config/site'

interface PageProps { params: Promise<{ id: string }> }

// Phase 11 caching -- same rationale as the Package detail page's
// revalidate: seat availability is live data, so a short ISR window
// balances DB load against showing a stale "seats left" count.
export const revalidate = 30

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) return { title: 'Trip not found' }
  const description = tour.description.slice(0, 160)
  return {
    title: tour.title,
    description,
    openGraph: {
      title: tour.title,
      description,
      images: tour.image ? [{ url: tour.image }] : undefined,
      type: 'website',
    },
  }
}

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) notFound()

  const meta = categoryMeta[resolveCategory(tour.category)]

  // Phase 11 SEO — TouristTrip JSON-LD, same rationale as the Package
  // detail page (see (public)/packages/[slug]/page.tsx).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.description,
    image: tour.image ? [tour.image] : undefined,
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'INR',
      availability: tour.availableSeats > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <div className="relative text-white py-16 px-4 overflow-hidden">
        {tour.image
          ? <Image src={tour.image} alt={tour.title} fill priority sizes="100vw" className="object-cover" />
          : <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-500" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/30" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex gap-2 mb-3">
            <Badge className="bg-white/20 border-white/30 text-white capitalize">{tour.status}</Badge>
            <Badge className={`border-white/30 text-white ${meta.badgeClass}/80`}>
              {meta.emoji} {meta.label}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow">{tour.title}</h1>
          <p className="text-orange-100 flex items-center gap-2"><MapPin size={16} />{tour.route}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-800 mb-4">Yatra Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: <Calendar size={16} className="text-orange-600" />, label: 'Start Date', value: new Date(tour.startDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: <Calendar size={16} className="text-orange-600" />, label: 'End Date', value: new Date(tour.endDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { icon: <Clock size={16} className="text-orange-600" />, label: 'Departure Time', value: tour.departureTime },
                { icon: <Users size={16} className="text-orange-600" />, label: 'Available Seats', value: `${tour.availableSeats} of ${tour.totalSeats}` },
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

          {tour.description && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-3">About this Yatra</h2>
              <p className="text-gray-600 leading-relaxed">{tour.description}</p>
            </div>
          )}

          {tour.services?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Services Included</h2>
              <ul className="grid grid-cols-2 gap-2">
                {tour.services.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.inclusions?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">What&apos;s Included</h2>
              <ul className="space-y-2">
                {tour.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={16} className="text-orange-500 shrink-0" />{inc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tour.pickupPoints?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-bold text-lg text-gray-800 mb-4">Pickup Points</h2>
              <ul className="space-y-2">
                {tour.pickupPoints.map((pp, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-orange-500 shrink-0" />{pp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sidebar - Booking */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
            <div className="text-3xl font-bold text-orange-600 mb-1">₹{tour.price.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">per person</div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Users size={14} />{tour.availableSeats} seats left
            </div>

            <BookingForm tourId={tour._id} tourTitle={tour.title} price={tour.price} qrImage={tour.qrImage} paymentNote={tour.paymentNote} />

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
