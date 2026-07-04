import type { Metadata } from 'next'
import { Users, Star, Bus, MapPin, Sparkles, HeartHandshake } from 'lucide-react'
import PageHero from '@/components/lux/PageHero'
import SectionHeading from '@/features/home/components/SectionHeading'
import Reveal from '@/features/home/components/Reveal'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  // Root layout's title.template appends " | <siteName>" (app/layout.tsx),
  // so this is just the page-specific segment.
  title: 'About Us',
  description: `Learn about ${siteConfig.name} — ${siteConfig.stats.happyTravellers} happy devotees served on spiritual yatras and holiday trips.`,
  openGraph: { title: 'About Us', description: `The story of service and devotion behind ${siteConfig.name}.` },
}

const values = [
  { icon: Bus, title: 'AC Transport', desc: 'Comfortable AC coaches & Volvo buses for every journey' },
  { icon: Star, title: 'Experienced Team', desc: 'Knowledgeable guides and staff at every step' },
  { icon: Users, title: 'Group Bonding', desc: 'Travel and connect with fellow devotees' },
  { icon: MapPin, title: 'Best Routes', desc: 'Carefully planned, time-tested itineraries' },
]

export default function AboutPage() {
  return (
    <div className="lux">
      <PageHero
        eyebrow="Our story"
        title="Service &"
        highlight="devotion"
        description="The people and the promise behind every Parth Saarthi journey."
        crumbs={[{ label: 'About Us' }]}
      />

      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gilt-400">
              <span className="h-px w-6 bg-gilt-500/50" /> Who we are
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-semibold text-white leading-tight">
              {siteConfig.name}
            </h2>
            <p className="mt-5 text-white/60 leading-relaxed">
              Founded by <strong className="text-white/90">{siteConfig.founder}</strong>, {siteConfig.name} has been serving
              thousands of devotees on their sacred pilgrimage journeys. We believe every soul deserves a comfortable and
              memorable yatra experience.
            </p>
            <p className="mt-4 text-white/60 leading-relaxed">
              Our tagline — <em className="text-gilt-200">&quot;{siteConfig.tagline}&quot;</em> ({siteConfig.taglineEn}) —
              reflects our commitment to making every journey a divine experience.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative rounded-3xl glass gilt-border p-10 text-center overflow-hidden">
              <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-gilt-500/15 blur-3xl" />
              <div className="relative">
                <Sparkles className="mx-auto text-gilt-300" size={30} />
                <div className="mt-6 font-display text-5xl font-semibold gilt-text">{siteConfig.stats.happyTravellers}</div>
                <div className="mt-2 text-white/60">Happy Devotees Served</div>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                  <div><div className="font-display text-2xl font-semibold text-white">{siteConfig.stats.tripsCompleted}</div><div className="text-xs text-white/45 mt-1">Trips</div></div>
                  <div><div className="font-display text-2xl font-semibold text-white">{siteConfig.stats.destinations}</div><div className="text-xs text-white/45 mt-1">Places</div></div>
                  <div><div className="font-display text-2xl font-semibold text-white">{siteConfig.stats.averageRating}</div><div className="text-xs text-white/45 mt-1">Rating</div></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20 bg-ink-850">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="The difference" title="Why choose" highlight="us" />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="hover-lift group h-full rounded-3xl glass gilt-border p-7">
                  <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gilt-300/20 to-gilt-600/10 border border-gilt-500/25 text-gilt-300 transition-transform duration-500 group-hover:scale-105">
                    <v.icon size={24} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative rounded-3xl glass gilt-border p-10 sm:p-14 text-center overflow-hidden">
              <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-[60%] rounded-full bg-gilt-500/10 blur-3xl" />
              <div className="relative">
                <span className="grid place-items-center w-14 h-14 mx-auto rounded-2xl bg-gilt-400/15 text-gilt-300"><HeartHandshake size={24} /></span>
                <h2 className="mt-6 font-display text-3xl font-semibold text-white">Our Mission</h2>
                <p className="mt-4 text-white/60 max-w-2xl mx-auto leading-relaxed">
                  To provide safe, comfortable, and spiritually enriching pilgrimage experiences to all devotees — making
                  sacred journeys accessible and memorable for everyone.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
