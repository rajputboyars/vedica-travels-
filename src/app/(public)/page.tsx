import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Phone, MapPin, Star, Users, Calendar, ArrowRight, MessageCircle, Bus, Utensils, Droplets, Sparkles, Mountain, Quote } from 'lucide-react'
import TourCard from '@/features/tours/components/TourCard'
import { listTours } from '@/services/tour.service'
import { getHomepageContent, getSiteSettings, listTestimonials } from '@/services/cms.service'
import { phoneHref } from '@/config/site'
import type { Tour } from '@/types'

// Phase 10 CMS -- "Homepage" + "Hero Banner" + "Testimonials": every
// section below is driven by HomepageContent/SiteSettings/Testimonial
// documents (editable at /admin/cms) instead of the hardcoded copy this
// page used to contain. Tours (Spiritual/Holiday showcase) are unchanged
// -- those are the pre-existing Tour catalog, not a Phase 10 CMS entity.
const whyTravelIcons = [Bus, Utensils, Droplets, MapPin]

// Phase 11 caching -- homepage reads (tours/homepage-content/settings/
// testimonials) are all direct DB calls, not fetch(); revalidate makes
// Next cache the rendered HTML for 60s (ISR) instead of re-querying
// MongoDB on every visit, while still picking up admin CMS edits within
// a minute.
export const revalidate = 60

// Phase 11 SEO -- homepage title intentionally uses `absolute` so it does
// NOT get " | <siteName>" appended by the root layout's title.template;
// the CMS-authored hero title (e.g. "... — Spiritual Yatras & Holiday
// Trips") is already the complete, brand-inclusive title admins expect.
export async function generateMetadata(): Promise<Metadata> {
  const [content, settings] = await Promise.all([getHomepageContent(), getSiteSettings()])
  const title = `${settings.siteName} — ${content.hero.subtitle}`
  return {
    title: { absolute: title },
    description: content.hero.description || settings.description,
    openGraph: { title, description: content.hero.description || settings.description, images: [{ url: content.hero.backgroundImage }] },
  }
}

export default async function HomePage() {
  const [all, content, settings, testimonials] = await Promise.all([
    listTours(),
    getHomepageContent(),
    getSiteSettings(),
    listTestimonials({ publishedOnly: true }),
  ])
  const upcoming = all.filter((t) => t.status === 'upcoming')
  const spiritual = upcoming.filter((t) => (t.category || 'spiritual') === 'spiritual').slice(0, 3)
  const leisure = upcoming.filter((t) => t.category === 'leisure').slice(0, 3)

  const whatsappUrl = `https://wa.me/${settings.contact.whatsapp}`
  const secondaryHref = content.hero.secondaryCtaHref || whatsappUrl

  return (
    <div>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        {/* Phase 11 — LCP element on this page, so priority (skips lazy
            loading) + fill (parent section provides the box via its own
            height from the padded content below) rather than a plain <img>. */}
        <Image
          src={content.hero.backgroundImage}
          alt="Travel"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/85 via-orange-800/80 to-amber-700/75" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <span className="inline-block mb-4 bg-white/20 border border-white/30 text-white text-sm px-4 py-1 rounded-full">
            {content.hero.badgeText}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
            {content.hero.title}
          </h1>
          <p className="text-xl sm:text-2xl text-orange-100 mb-2 font-medium">{content.hero.subtitle}</p>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto text-lg">
            {content.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={content.hero.primaryCtaHref}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8">
                {content.hero.primaryCtaLabel} <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <a href={secondaryHref} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                <MessageCircle className="mr-2" size={18} /> {content.hero.secondaryCtaLabel}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Category chooser */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {content.categoryTiles.map((tile, i) => (
            <Link key={i} href={tile.href} className="group">
              <div className="relative h-44 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-orange-900/20 flex flex-col justify-end p-5">
                  {i === 0 ? <Sparkles className="text-amber-300 mb-1" size={22} /> : <Mountain className="text-emerald-200 mb-1" size={22} />}
                  <h3 className="text-white text-xl font-bold">{tile.title}</h3>
                  <p className="text-orange-100 text-sm">{tile.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="mt-14">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Users size={24} className="text-orange-600" />, value: settings.stats.happyTravellers, label: 'Happy Travellers' },
            { icon: <Calendar size={24} className="text-orange-600" />, value: settings.stats.tripsCompleted, label: 'Trips Completed' },
            { icon: <MapPin size={24} className="text-orange-600" />, value: settings.stats.destinations, label: 'Destinations' },
            { icon: <Star size={24} className="text-orange-600" />, value: settings.stats.averageRating, label: 'Average Rating' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-amber-50 rounded-xl py-5 border border-amber-100">
              {s.icon}
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <ShowcaseSection title="🛕 Spiritual Yatras" subtitle="Sacred pilgrimages departing soon — book your seat today" tours={spiritual} />
      <ShowcaseSection title="🏔️ Holiday Trips" subtitle="Mountains, valleys & adventure — getaways for family and friends" tours={leisure} muted />

      {/* Services */}
      <section className="bg-orange-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Why Travel With Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.whyTravelWithUs.map((item, i) => {
              const Icon = whyTravelIcons[i % whyTravelIcons.length]
              return (
                <Card key={i} className="text-center p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-center mb-3"><Icon size={32} className="text-orange-600" /></div>
                  <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">What Our Travellers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((t) => (
                <Card key={t._id} className="p-6">
                  <Quote className="text-orange-200 mb-2" size={28} />
                  <p className="text-gray-600 text-sm mb-4 italic">&quot;{t.message}&quot;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                      {t.location && <div className="text-xs text-gray-400">{t.location}</div>}
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{content.ctaTitle}</h2>
          <p className="text-orange-100 mb-8 text-lg">{content.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={phoneHref(settings.contact.primaryPhone)}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold">
                <Phone className="mr-2" size={18} /> Call: {settings.contact.primaryPhone}
              </Button>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <MessageCircle className="mr-2" size={18} /> WhatsApp Us
              </Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-200">Pickup Point: {settings.address.pickupLabel}</p>
        </div>
      </section>
    </div>
  )
}

function ShowcaseSection({ title, subtitle, tours, muted }: { title: string; subtitle: string; tours: Tour[]; muted?: boolean }) {
  if (tours.length === 0) return null
  return (
    <section className={`py-16 px-4 ${muted ? 'bg-[#fbf3e7]' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tours.map((tour) => <TourCard key={tour._id} tour={tour} variant="compact" />)}
        </div>
        <div className="text-center">
          <Link href="/tours"><Button variant="outline" size="lg">View All Trips <ArrowRight className="ml-2" size={16} /></Button></Link>
        </div>
      </div>
    </section>
  )
}
