import type { Metadata } from 'next'
import { Phone, MapPin, MessageCircle, Clock, Mail, PhoneCall } from 'lucide-react'
import PageHero from '@/components/lux/PageHero'
import Reveal from '@/features/home/components/Reveal'
import LazyMap from '@/features/home/components/LazyMap'
import { phoneHref } from '@/config/site'
import { getSiteSettings } from '@/services/cms.service'

// Phase 11 caching -- contact info changes infrequently.
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    // Root layout's title.template appends " | <siteName>" automatically
    // (see app/layout.tsx), so page-level titles here are just the page
    // name -- avoids "Contact Us | Brand | Brand" duplication.
    title: 'Contact Us',
    description: `Get in touch with ${settings.siteName} to plan your next spiritual yatra or holiday trip. Call, WhatsApp, or visit our pickup point.`,
    openGraph: { title: 'Contact Us', description: `Get in touch with ${settings.siteName} for your next yatra or trip.` },
  }
}

// Phase 10 CMS -- "Contact Information": every value here now comes from
// SiteSettings (editable at /admin/cms/site-settings) instead of the
// hardcoded config/site.ts constants.
export default async function ContactPage() {
  const settings = await getSiteSettings()
  const whatsappUrl = `https://wa.me/${settings.contact.whatsapp}`
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(settings.address.pickupLabel)}&output=embed`

  const items = [
    { icon: Phone, title: 'Phone', lines: settings.contact.phones, hrefs: settings.contact.phones.map(phoneHref) },
    { icon: MessageCircle, title: 'WhatsApp', lines: ['Chat on WhatsApp'], hrefs: [whatsappUrl] },
    { icon: Mail, title: 'Email', lines: [settings.contact.email], hrefs: [`mailto:${settings.contact.email}`] },
    { icon: MapPin, title: 'Pickup Point', lines: [settings.address.line1, settings.address.line2] },
    { icon: Clock, title: 'Contact Person', lines: [settings.founder] },
  ]

  return (
    <div className="lux">
      <PageHero
        eyebrow="Plan your journey"
        title="Let's craft your"
        highlight="next yatra"
        description="Call us before booking — we'll help you pick the right departure, pickup point and package."
        crumbs={[{ label: 'Contact' }]}
      />

      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-stretch">
          <Reveal>
            <div className="h-full rounded-3xl glass gilt-border p-8 sm:p-10">
              <h2 className="font-display text-2xl font-semibold text-white">Get in touch</h2>
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4">
                    <span className="grid place-items-center w-11 h-11 shrink-0 rounded-full bg-gilt-400/15 text-gilt-300"><item.icon size={18} /></span>
                    <div>
                      <div className="text-xs text-white/45">{item.title}</div>
                      {item.lines.map((line, i) =>
                        item.hrefs?.[i] ? (
                          <a key={i} href={item.hrefs[i]} target={item.hrefs[i].startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block font-medium text-white hover:text-gilt-300 transition-colors">{line}</a>
                        ) : (
                          <div key={i} className="font-medium text-white">{line}</div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a href={phoneHref(settings.contact.primaryPhone)} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-7 py-3.5 text-sm font-semibold text-ink-900 gilt-glow">
                  <PhoneCall size={16} /> Call Now
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full glass gilt-border px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5 transition-colors">
                  <MessageCircle size={16} className="text-emerald-300" /> WhatsApp Us
                </a>
              </div>
              <p className="mt-4 text-sm text-white/45">{settings.contact.availability}</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full min-h-[420px] overflow-hidden rounded-3xl gilt-border">
              <LazyMap src={mapSrc} label={settings.address.pickupLabel} />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
