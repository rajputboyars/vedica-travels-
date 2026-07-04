import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Calendar, Clock, MapPin, Users, Phone, MessageCircle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'
import BookingForm from '@/features/booking/components/BookingForm'
import Reveal from '@/features/home/components/Reveal'
import { getTour } from '@/services/tour.service'
import { categoryMeta, resolveCategory } from '@/config/theme'
import { siteConfig, phoneHref } from '@/config/site'

interface PageProps { params: Promise<{ id: string }> }

// Phase 11 caching -- seat availability is live data, so a short ISR window.
export const revalidate = 30

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) return { title: 'Trip not found' }
  const description = tour.description.slice(0, 160)
  return {
    title: tour.title,
    description,
    openGraph: { title: tour.title, description, images: tour.image ? [{ url: tour.image }] : undefined, type: 'website' },
  }
}

const FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop'

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params
  const tour = await getTour(id)
  if (!tour) notFound()

  const meta = categoryMeta[resolveCategory(tour.category)]
  const nights = Math.max(0, Math.round((+new Date(tour.endDate) - +new Date(tour.startDate)) / 86_400_000))

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

  const facts = [
    { icon: Calendar, label: 'Start Date', value: new Date(tour.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) },
    { icon: Calendar, label: 'End Date', value: new Date(tour.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) },
    { icon: Clock, label: 'Departure', value: tour.departureTime },
    { icon: Users, label: 'Seats', value: `${tour.availableSeats} of ${tour.totalSeats}` },
  ]

  return (
    <div className="lux">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Image src={tour.image || FALLBACK} alt={tour.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/70 to-ink-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 to-transparent" />
        <div className="aura absolute inset-0" />
        <div className="relative max-w-6xl mx-auto">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-white/55">
            <Link href="/" className="hover:text-gilt-300">Home</Link><ChevronRight size={14} className="text-white/30" />
            <Link href="/tours" className="hover:text-gilt-300">Tours</Link><ChevronRight size={14} className="text-white/30" />
            <span className="text-gilt-300 line-clamp-1">{tour.title}</span>
          </nav>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-ink-900/70 border border-gilt-500/25 px-3 py-1 text-xs text-gilt-300">{meta.emoji} {meta.label}</span>
            <span className="rounded-full glass px-3 py-1 text-xs text-white/80 capitalize">{tour.status}</span>
            {nights > 0 && <span className="rounded-full glass px-3 py-1 text-xs text-white/80">{nights}N / {nights + 1}D</span>}
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-white leading-[1.05] max-w-3xl">{tour.title}</h1>
          <p className="mt-4 flex items-center gap-2 text-white/65"><MapPin size={16} className="text-gilt-400" />{tour.route}</p>
        </div>
      </section>

      {/* Body */}
      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Reveal>
              <div className="rounded-3xl glass gilt-border p-7">
                <h2 className="font-display text-xl font-semibold text-white mb-5">Yatra Details</h2>
                <div className="grid grid-cols-2 gap-5">
                  {facts.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-gilt-400/15 text-gilt-300"><f.icon size={17} /></span>
                      <div>
                        <div className="text-xs text-white/45">{f.label}</div>
                        <div className="font-medium text-white text-sm">{f.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {tour.description && (
              <Reveal>
                <div className="rounded-3xl glass gilt-border p-7">
                  <h2 className="font-display text-xl font-semibold text-white mb-3 flex items-center gap-2"><Sparkles size={18} className="text-gilt-300" /> About this Yatra</h2>
                  <p className="text-white/65 leading-relaxed">{tour.description}</p>
                </div>
              </Reveal>
            )}

            {tour.inclusions?.length > 0 && (
              <Reveal>
                <div className="rounded-3xl glass gilt-border p-7">
                  <h2 className="font-display text-xl font-semibold text-white mb-4">What&apos;s Included</h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {tour.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />{inc}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {tour.pickupPoints?.length > 0 && (
              <Reveal>
                <div className="rounded-3xl glass gilt-border p-7">
                  <h2 className="font-display text-xl font-semibold text-white mb-4">Pickup Points</h2>
                  <ul className="space-y-3">
                    {tour.pickupPoints.map((pp, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/70">
                        <MapPin size={16} className="text-gilt-400 shrink-0" />{pp}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky booking island (light surface keeps the working multi-step form legible) */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl bg-white text-gray-900 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-gilt-500/20">
              <div className="flex items-end justify-between mb-1">
                <div className="text-3xl font-bold text-orange-600">₹{tour.price.toLocaleString('en-IN')}</div>
                <div className="text-sm text-gray-500">per person</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6"><Users size={14} /> {tour.availableSeats} seats left</div>
              <BookingForm tourId={tour._id} tourTitle={tour.title} price={tour.price} qrImage={tour.qrImage} paymentNote={tour.paymentNote} />
            </div>

            <div className="flex flex-col gap-3">
              <a href={phoneHref(siteConfig.contact.primaryPhone)} className="flex items-center justify-center gap-2 rounded-full glass gilt-border px-5 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                <Phone size={15} className="text-gilt-300" /> Call {siteConfig.contact.primaryPhone}
              </a>
              <a href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-emerald-500/90 hover:bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors">
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
