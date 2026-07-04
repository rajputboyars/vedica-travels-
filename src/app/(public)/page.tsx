import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  Phone, MessageCircle, ArrowRight, ArrowUpRight, Star, MapPin, Quote,
  Sparkles, Mountain, Compass, Users2, Briefcase, CalendarDays, Clock, ShieldCheck,
  BusFront, Utensils, HeartHandshake, PhoneCall, Mail, ChevronRight,
} from 'lucide-react'
import { listTours } from '@/services/tour.service'
import { getHomepageContent, getSiteSettings, listTestimonials, listBlogs, listFAQs } from '@/services/cms.service'
import { listImages } from '@/services/gallery.service'
import { phoneHref } from '@/config/site'
import Reveal from '@/features/home/components/Reveal'
import SectionHeading from '@/features/home/components/SectionHeading'
import LuxTourCard from '@/features/home/components/LuxTourCard'
import FaqAccordion from '@/features/home/components/FaqAccordion'
import LazyMap from '@/features/home/components/LazyMap'

// Phase 11 caching -- all reads are direct DB calls; ISR caches the
// rendered HTML for 60s while still picking up admin CMS edits.
export const revalidate = 60

const uns = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`

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
  const [all, content, settings, testimonials, blogs, faqs, gallery] = await Promise.all([
    listTours(),
    getHomepageContent(),
    getSiteSettings(),
    listTestimonials({ publishedOnly: true }),
    listBlogs({ status: 'published' }),
    listFAQs({ publishedOnly: true }),
    listImages(),
  ])

  const upcoming = all
    .filter((t) => t.status === 'upcoming')
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
  const featured = (all.filter((t) => t.featured && t.status === 'upcoming').length ? all.filter((t) => t.featured && t.status === 'upcoming') : upcoming).slice(0, 6)
  const nextTrip = upcoming[0]

  const whatsappUrl = `https://wa.me/${settings.contact.whatsapp}`
  const secondaryHref = content.hero.secondaryCtaHref || whatsappUrl
  const stats = [
    { value: settings.stats.happyTravellers, label: 'Happy Travellers' },
    { value: settings.stats.tripsCompleted, label: 'Trips Completed' },
    { value: settings.stats.destinations, label: 'Destinations' },
    { value: settings.stats.averageRating, label: 'Guest Rating' },
  ]

  const categories = [
    { title: 'Spiritual Yatras', sub: 'Khatu Shyam · Vrindavan · Haridwar', img: uns('photo-1605649487212-47bdab064df7'), href: '/tours?cat=spiritual', Icon: Sparkles },
    { title: 'Holiday Trips', sub: 'Manali · Mussoorie · Shimla', img: uns('photo-1626621341517-bbf3d9990a23'), href: '/tours?cat=leisure', Icon: Mountain },
    { title: 'Weekend Getaways', sub: 'Short escapes, big memories', img: uns('photo-1571536802807-30451e3955d8'), href: '/tours', Icon: Compass },
    { title: 'Family Tours', sub: 'Travel together, stay together', img: uns('photo-1593181629936-11c609b8db9b'), href: '/tours', Icon: Users2 },
    { title: 'Corporate Tours', sub: 'Offsites & group retreats', img: uns('photo-1561361513-2d000a50f0dc'), href: '/contact', Icon: Briefcase },
  ]

  const destinations = [
    { name: 'Khatu Shyam Ji', tag: 'Rajasthan', img: uns('photo-1605649487212-47bdab064df7', 1000), span: 'lg:col-span-2 lg:row-span-2' },
    { name: 'Vrindavan', tag: 'Uttar Pradesh', img: uns('photo-1604608672516-f1b9b1d37076', 800), span: '' },
    { name: 'Haridwar', tag: 'Uttarakhand', img: uns('photo-1561361513-2d000a50f0dc', 800), span: '' },
    { name: 'Manali', tag: 'Himachal', img: uns('photo-1626621341517-bbf3d9990a23', 800), span: '' },
    { name: 'Rishikesh', tag: 'Uttarakhand', img: uns('photo-1571536802807-30451e3955d8', 800), span: '' },
  ]

  const whyIcons = [BusFront, Utensils, ShieldCheck, HeartHandshake]
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(settings.address.pickupLabel)}&output=embed`

  return (
    <div className="lux overflow-hidden">
      {/* ============================ HERO ============================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image
          src={content.hero.backgroundImage}
          alt="Sacred journeys across India"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/75 via-ink-900/55 to-ink-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/85 via-ink-900/30 to-transparent" />
        <div className="aura absolute inset-0" />

        <div className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-7">
              <Reveal>
                <span className="animate-floaty inline-flex items-center gap-2 rounded-full glass gilt-border px-4 py-2 text-xs sm:text-sm text-gilt-200">
                  <Sparkles size={14} className="text-gilt-300" /> {content.hero.badgeText}
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.04] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
                  Experience India<br />Like <span className="gilt-text">Never Before</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 font-display text-xl sm:text-2xl italic text-gilt-200/90">{content.hero.subtitle}</p>
              </Reveal>
              <Reveal delay={220}>
                <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-white/65">{content.hero.description}</p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-9 flex flex-col sm:flex-row gap-4">
                  <Link
                    href={content.hero.primaryCtaHref}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-8 py-4 text-sm font-semibold text-ink-900 gilt-glow transition-all"
                  >
                    {content.hero.primaryCtaLabel}
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href={secondaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full glass gilt-border px-8 py-4 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                  >
                    <MessageCircle size={17} className="text-emerald-300" /> {content.hero.secondaryCtaLabel}
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Floating booking card */}
            {nextTrip && (
              <div className="lg:col-span-5 lg:justify-self-end w-full max-w-sm">
                <Reveal delay={240}>
                  <div className="glass-strong gilt-border rounded-3xl p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gilt-400">
                      <CalendarDays size={14} /> Next Departure
                    </div>
                    <div className="mt-4 relative h-40 rounded-2xl overflow-hidden">
                      <Image src={nextTrip.image || content.hero.backgroundImage} alt={nextTrip.title} fill sizes="400px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-ink-900/70 border border-gilt-500/25 px-3 py-1 text-xs text-gilt-200">
                        {nextTrip.availableSeats} seats left
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-white leading-snug line-clamp-1">{nextTrip.title}</h3>
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-white/55">
                      <MapPin size={14} className="text-gilt-400 shrink-0" /><span className="line-clamp-1">{nextTrip.route}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Clock size={15} className="text-gilt-400" />
                        {new Date(nextTrip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-white/40">From</span>
                        <span className="font-display text-2xl font-semibold gilt-text">₹{nextTrip.price.toLocaleString('en-IN')}</span>
                      </div>
                      <Link
                        href={`/tours/${nextTrip._id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-gilt-400 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:bg-gilt-300 transition-colors"
                      >
                        Book Now <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            )}
          </div>

          {/* Floating stats */}
          <Reveal delay={120}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 rounded-3xl glass gilt-border overflow-hidden">
              {stats.map((s) => (
                <div key={s.label} className="px-6 py-6 text-center">
                  <div className="font-display text-3xl sm:text-4xl font-semibold gilt-text">{s.value}</div>
                  <div className="mt-1 text-xs sm:text-sm text-white/55">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= POPULAR CATEGORIES ======================= */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="What moves you" title="Journeys for every" highlight="calling" subtitle="From sacred pilgrimages to mountain escapes — choose the experience that speaks to your soul." />
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((c, i) => (
              <Reveal key={c.title} delay={i * 70} className={i === 0 ? 'col-span-2 lg:col-span-1' : ''}>
                <Link href={c.href} className="group relative block h-72 lg:h-[26rem] overflow-hidden rounded-3xl gilt-border">
                  <Image src={c.img} alt={c.title} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="grid place-items-center w-11 h-11 rounded-full glass gilt-border text-gilt-300 mb-3 transition-transform duration-500 group-hover:-translate-y-1">
                      <c.Icon size={18} />
                    </span>
                    <h3 className="font-display text-lg font-semibold text-white leading-tight">{c.title}</h3>
                    <p className="mt-1 text-xs text-white/55">{c.sub}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gilt-300 opacity-0 -translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                      View trips <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= FEATURED PACKAGES ======================= */}
      {featured.length > 0 && (
        <section className="relative py-24 px-6 bg-ink-850">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <SectionHeading align="left" eyebrow="Handpicked" title="Featured" highlight="departures" subtitle="Curated journeys our travellers love, ready to book." />
              <Reveal>
                <Link href="/tours" className="inline-flex items-center gap-2 rounded-full glass gilt-border px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                  View all trips <ArrowRight size={15} className="text-gilt-300" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {featured.map((tour, i) => (
                <Reveal key={tour._id} delay={i * 60}><LuxTourCard tour={tour} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================= WHY CHOOSE US ======================= */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="The difference" title="Why travellers" highlight="trust us" subtitle="Every detail is handled so you can focus on the experience, not the logistics." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.whyTravelWithUs.map((item, i) => {
              const Icon = whyIcons[i % whyIcons.length]
              return (
                <Reveal key={i} delay={i * 70}>
                  <div className="hover-lift group h-full rounded-3xl glass gilt-border p-7">
                    <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gilt-300/20 to-gilt-600/10 border border-gilt-500/25 text-gilt-300 transition-transform duration-500 group-hover:scale-105">
                      <Icon size={24} />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{item.description}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================= UPCOMING DEPARTURES ======================= */}
      {upcoming.length > 0 && (
        <section className="relative py-24 px-6 bg-ink-850">
          <div className="max-w-5xl mx-auto">
            <SectionHeading eyebrow="Mark your calendar" title="Upcoming" highlight="departures" subtitle="Seats fill fast — reserve your place on the next journey out." />
            <div className="mt-14 relative pl-8 sm:pl-0">
              <div className="absolute left-[7px] sm:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-gilt-500/60 via-gilt-500/20 to-transparent sm:-translate-x-1/2" />
              <div className="space-y-8">
                {upcoming.slice(0, 5).map((t, i) => (
                  <Reveal key={t._id} delay={i * 60}>
                    <div className={`relative sm:grid sm:grid-cols-2 sm:gap-10 ${i % 2 ? 'sm:[direction:rtl]' : ''}`}>
                      <span className="absolute -left-8 sm:left-1/2 top-2 grid place-items-center w-4 h-4 rounded-full bg-gilt-400 ring-4 ring-gilt-500/20 sm:-translate-x-1/2" />
                      <div className={`[direction:ltr] ${i % 2 ? 'sm:col-start-2' : ''}`}>
                        <Link href={`/tours/${t._id}`} className="hover-lift group block rounded-3xl glass gilt-border p-6">
                          <div className="flex items-center gap-2 text-xs text-gilt-300">
                            <CalendarDays size={14} />
                            {new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <h3 className="mt-2 font-display text-xl font-semibold text-white group-hover:text-gilt-200 transition-colors line-clamp-1">{t.title}</h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/55"><MapPin size={13} className="text-gilt-400" /><span className="line-clamp-1">{t.route}</span></p>
                          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                            <span className="font-display text-lg font-semibold gilt-text">₹{t.price.toLocaleString('en-IN')}</span>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gilt-300">{t.availableSeats} seats <ChevronRight size={15} /></span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================= POPULAR DESTINATIONS ======================= */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Where to next" title="Popular" highlight="destinations" subtitle="Iconic temples, holy rivers and Himalayan valleys — all within reach." />
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 auto-rows-[200px] gap-4">
            {destinations.map((d, i) => (
              <Reveal key={d.name} delay={i * 60} className={d.span}>
                <Link href="/tours" className="group relative block h-full w-full overflow-hidden rounded-3xl gilt-border">
                  <Image src={d.img} alt={d.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-gilt-300">{d.tag}</span>
                    <h3 className="font-display text-xl font-semibold text-white">{d.name}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= TESTIMONIALS ======================= */}
      {testimonials.length > 0 && (
        <section className="relative py-24 px-6 bg-ink-850">
          <div className="max-w-7xl mx-auto">
            <SectionHeading eyebrow="Loved by travellers" title="Words from our" highlight="pilgrims" />
            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((t, i) => (
                <Reveal key={t._id} delay={i * 60}>
                  <figure className="hover-lift h-full rounded-3xl glass gilt-border p-7 flex flex-col">
                    <Quote className="text-gilt-400/60" size={30} />
                    <blockquote className="mt-4 flex-1 text-white/75 leading-relaxed">“{t.message}”</blockquote>
                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
                      <figcaption>
                        <div className="font-medium text-white">{t.name}</div>
                        {t.location && <div className="text-xs text-white/45">{t.location}</div>}
                      </figcaption>
                      <div className="flex gap-0.5 text-gilt-300">
                        {Array.from({ length: t.rating }).map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================= GALLERY (masonry) ======================= */}
      {gallery.length > 0 && (
        <section className="relative py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <SectionHeading eyebrow="Moments" title="From our" highlight="journeys" subtitle="Real memories from real travellers across sacred and scenic India." />
            <div className="mt-14 columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
              {gallery.slice(0, 12).map((g, i) => (
                <Reveal key={g._id} delay={(i % 4) * 60} className="mb-4 break-inside-avoid">
                  <div className="group relative overflow-hidden rounded-2xl gilt-border">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied gallery URL of unknown aspect ratio; masonry needs the image's natural height */}
                    <img src={g.url} alt={g.caption || 'Gallery'} loading="lazy" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {g.caption && <span className="absolute bottom-3 left-3 right-3 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">{g.caption}</span>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================= BLOG ======================= */}
      {blogs.length > 0 && (
        <section className="relative py-24 px-6 bg-ink-850">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <SectionHeading align="left" eyebrow="Travel journal" title="Stories &" highlight="guides" subtitle="Tips, temple guides and travel inspiration for your next yatra." />
              <Reveal>
                <Link href="/blogs" className="inline-flex items-center gap-2 rounded-full glass gilt-border px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                  All articles <ArrowRight size={15} className="text-gilt-300" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-7">
              {blogs.slice(0, 3).map((b, i) => (
                <Reveal key={b._id} delay={i * 70}>
                  <Link href={`/blogs/${b.slug}`} className="hover-lift group flex flex-col h-full overflow-hidden rounded-3xl glass gilt-border">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={b.coverImage || uns('photo-1469474968028-56623f02e42e', 900)} alt={b.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1.1s] group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      {b.tags[0] && <span className="text-[11px] uppercase tracking-[0.2em] text-gilt-300">{b.tags[0]}</span>}
                      <h3 className="mt-2 font-display text-lg font-semibold text-white leading-snug line-clamp-2 group-hover:text-gilt-200 transition-colors">{b.title}</h3>
                      <p className="mt-2 text-sm text-white/55 line-clamp-2">{b.excerpt}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-gilt-300">Read more <ArrowUpRight size={14} /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================= FAQ ======================= */}
      {faqs.length > 0 && (
        <section className="relative py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <SectionHeading eyebrow="Good to know" title="Frequently asked" highlight="questions" />
            <div className="mt-12">
              <FaqAccordion items={faqs.slice(0, 6)} />
            </div>
          </div>
        </section>
      )}

      {/* ======================= CONTACT ======================= */}
      <section className="relative py-24 px-6 bg-ink-850">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            <Reveal>
              <div className="h-full rounded-3xl glass gilt-border p-8 sm:p-10 flex flex-col">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gilt-400">
                  <span className="h-px w-6 bg-gilt-500/50" /> Plan your journey
                </span>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold text-white leading-tight">
                  Let&apos;s craft your <span className="gilt-text">next yatra</span>
                </h2>
                <p className="mt-4 text-white/60 leading-relaxed">
                  Call us before booking — we&apos;ll help you pick the right departure, pickup point and package for your family.
                </p>

                <div className="mt-8 space-y-4">
                  {settings.contact.phones.map((p) => (
                    <a key={p} href={phoneHref(p)} className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 hover:border-gilt-500/30 transition-colors">
                      <span className="grid place-items-center w-11 h-11 rounded-full bg-gilt-400/15 text-gilt-300"><PhoneCall size={18} /></span>
                      <div>
                        <div className="text-xs text-white/45">Call us</div>
                        <div className="font-medium text-white">{p}</div>
                      </div>
                    </a>
                  ))}
                  <a href={`mailto:${settings.contact.email}`} className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 hover:border-gilt-500/30 transition-colors">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-gilt-400/15 text-gilt-300"><Mail size={18} /></span>
                    <div>
                      <div className="text-xs text-white/45">Email</div>
                      <div className="font-medium text-white">{settings.contact.email}</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-gilt-400/15 text-gilt-300"><MapPin size={18} /></span>
                    <div>
                      <div className="text-xs text-white/45">Pickup point</div>
                      <div className="font-medium text-white">{settings.address.pickupLabel}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-7 py-3.5 text-sm font-semibold text-ink-900 gilt-glow">
                    <MessageCircle size={16} /> WhatsApp Us
                  </a>
                  <a href={phoneHref(settings.contact.primaryPhone)} className="inline-flex items-center justify-center gap-2 rounded-full glass gilt-border px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
                    <Phone size={16} className="text-gilt-300" /> Call {settings.contact.primaryPhone}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="h-full min-h-[360px] overflow-hidden rounded-3xl gilt-border">
                <LazyMap src={mapSrc} label={settings.address.pickupLabel} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
