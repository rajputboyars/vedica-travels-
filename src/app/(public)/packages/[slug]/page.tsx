import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, Clock, MapPin, Users, Phone, MessageCircle, CheckCircle2, XCircle, ChevronRight, ArrowRight } from 'lucide-react'
import FaqAccordion from '@/features/home/components/FaqAccordion'
import Reveal from '@/features/home/components/Reveal'
import { getPackageBySlug } from '@/services/package.service'
import { getSeatAvailability } from '@/services/registration.service'
import { packageCategoryMeta } from '@/config/package-theme'
import { siteConfig, phoneHref } from '@/config/site'

interface PageProps { params: Promise<{ slug: string }> }

// Phase 11 caching -- live seat availability, short ISR window.
export const revalidate = 30

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return { title: 'Package not found' }
  const description = pkg.metaDescription || pkg.description.slice(0, 160)
  return {
    title: pkg.metaTitle ? { absolute: pkg.metaTitle } : pkg.title,
    description,
    openGraph: { title: pkg.metaTitle || pkg.title, description, images: pkg.images?.[0] ? [{ url: pkg.images[0] }] : undefined, type: 'website' },
  }
}

const FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop'

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) notFound()

  const meta = packageCategoryMeta[pkg.category]
  const availability = await getSeatAvailability(pkg._id)
  const gallery = (pkg.gallery?.length ? pkg.gallery : pkg.images) || []

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

  const facts = [
    { icon: Calendar, label: 'Duration', value: `${pkg.duration.days}D / ${pkg.duration.nights}N` },
    { icon: Users, label: 'Seats', value: `${availability.available} of ${availability.totalSeats}` },
    { icon: Clock, label: 'Category', value: meta.label },
  ]

  return (
    <div className="lux">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-32 pb-16 lg:pt-40 lg:pb-20">
        <Image src={pkg.images?.[0] || FALLBACK} alt={pkg.title} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/80 via-ink-900/70 to-ink-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 to-transparent" />
        <div className="aura absolute inset-0" />
        <div className="relative max-w-6xl mx-auto">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-white/55">
            <Link href="/" className="hover:text-gilt-300">Home</Link><ChevronRight size={14} className="text-white/30" />
            <Link href="/packages" className="hover:text-gilt-300">Packages</Link><ChevronRight size={14} className="text-white/30" />
            <span className="text-gilt-300 line-clamp-1">{pkg.title}</span>
          </nav>
          <div className="mt-6"><span className="rounded-full bg-ink-900/70 border border-gilt-500/25 px-3 py-1 text-xs text-gilt-300">{meta.emoji} {meta.label}</span></div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-semibold text-white leading-[1.05] max-w-3xl">{pkg.title}</h1>
          {pkg.shortDescription && <p className="mt-4 max-w-2xl text-white/65 leading-relaxed">{pkg.shortDescription}</p>}
        </div>
      </section>

      {/* Body */}
      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Reveal>
              <div className="rounded-3xl glass gilt-border p-7">
                <div className="grid grid-cols-3 gap-4">
                  {facts.map((f, i) => (
                    <div key={i} className="text-center">
                      <span className="grid place-items-center w-11 h-11 mx-auto rounded-xl bg-gilt-400/15 text-gilt-300"><f.icon size={18} /></span>
                      <div className="mt-3 text-xs text-white/45">{f.label}</div>
                      <div className="font-medium text-white text-sm">{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {pkg.description && (
              <Reveal>
                <div className="rounded-3xl glass gilt-border p-7">
                  <h2 className="font-display text-xl font-semibold text-white mb-3">About this Package</h2>
                  <p className="text-white/65 leading-relaxed">{pkg.description}</p>
                </div>
              </Reveal>
            )}

            {gallery.length > 1 && (
              <Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.slice(0, 6).map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-2xl gilt-border">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied gallery URL of unknown host/format */}
                      <img src={src} alt={`${pkg.title} ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {pkg.itinerary.length > 0 && (
              <Reveal>
                <div className="rounded-3xl glass gilt-border p-7">
                  <h2 className="font-display text-xl font-semibold text-white mb-6">Itinerary</h2>
                  <div className="relative pl-8">
                    <div className="absolute left-[13px] top-1 bottom-1 w-px bg-gradient-to-b from-gilt-500/60 via-gilt-500/25 to-transparent" />
                    <div className="space-y-6">
                      {pkg.itinerary.map((day, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-8 top-0 grid place-items-center w-7 h-7 rounded-full bg-gilt-400 text-ink-900 text-xs font-bold ring-4 ring-gilt-500/15">{day.day}</span>
                          <div className="font-medium text-white">{day.title}</div>
                          {day.description && <div className="mt-1 text-sm text-white/55 leading-relaxed">{day.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            {(pkg.includedServices.length > 0 || pkg.excludedServices.length > 0) && (
              <Reveal>
                <div className="grid sm:grid-cols-2 gap-6">
                  {pkg.includedServices.length > 0 && (
                    <div className="rounded-3xl glass gilt-border p-7">
                      <h3 className="font-display text-lg font-semibold text-white mb-4">What&apos;s Included</h3>
                      <ul className="space-y-3">
                        {pkg.includedServices.map((s, i) => <li key={i} className="flex items-center gap-2.5 text-sm text-white/70"><CheckCircle2 size={16} className="text-emerald-400 shrink-0" />{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {pkg.excludedServices.length > 0 && (
                    <div className="rounded-3xl glass gilt-border p-7">
                      <h3 className="font-display text-lg font-semibold text-white mb-4">Not Included</h3>
                      <ul className="space-y-3">
                        {pkg.excludedServices.map((s, i) => <li key={i} className="flex items-center gap-2.5 text-sm text-white/70"><XCircle size={16} className="text-rose-400 shrink-0" />{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </Reveal>
            )}

            {pkg.pickupPoints.length > 0 && (
              <Reveal>
                <div className="rounded-3xl glass gilt-border p-7">
                  <h2 className="font-display text-xl font-semibold text-white mb-4">Pickup Points</h2>
                  <ul className="space-y-3">
                    {pkg.pickupPoints.map((pp, i) => <li key={i} className="flex items-center gap-2.5 text-sm text-white/70"><MapPin size={16} className="text-gilt-400 shrink-0" />{pp}</li>)}
                  </ul>
                </div>
              </Reveal>
            )}

            {pkg.faqs.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="font-display text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
                  <FaqAccordion items={pkg.faqs.map((f, i) => ({ _id: `pkg-faq-${i}`, question: f.question, answer: f.answer, order: i, published: true, createdAt: '', updatedAt: '' }))} />
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky booking card */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl glass-strong gilt-border p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
              <div className="flex items-end justify-between">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-white/40">Starting from</span>
                  <span className="font-display text-3xl font-semibold gilt-text">₹{pkg.price.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-sm text-white/45">/ person</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-white/60">
                <Users size={15} className="text-gilt-400" />
                {availability.available > 0 ? `${availability.available} seats left` : 'Fully booked — waiting list open'}
              </div>

              <Link
                href={`/packages/${pkg.slug}/register`}
                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-6 py-3.5 text-sm font-semibold text-ink-900 gilt-glow"
              >
                {availability.available > 0 ? 'Register Now' : 'Join Waiting List'} <ArrowRight size={16} />
              </Link>
              <p className="mt-3 text-xs text-white/45 text-center leading-relaxed">
                {availability.available > 0 ? 'No online payment — pay by QR after registering.' : "You'll be added to the waiting list and notified the moment a seat opens up."}
              </p>

              <div className="mt-5 pt-5 border-t border-white/5 flex flex-col gap-3">
                <a href={phoneHref(siteConfig.contact.primaryPhone)} className="flex items-center justify-center gap-2 rounded-full glass gilt-border px-5 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                  <Phone size={15} className="text-gilt-300" /> Call {siteConfig.contact.primaryPhone}
                </a>
                <a href={siteConfig.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-emerald-500/90 hover:bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors">
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
