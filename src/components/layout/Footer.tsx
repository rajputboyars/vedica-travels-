import Link from 'next/link'
import { Phone, MapPin, MessageCircle, ArrowUpRight, Mail } from 'lucide-react'
import { siteConfig, phoneHref } from '@/config/site'
import { publicNavLinks } from '@/config/nav'
import type { SiteSettings } from '@/types'

interface Props {
  // Phase 10 CMS -- see Navbar.tsx's Props comment for why this is
  // optional-with-fallback rather than required.
  settings?: SiteSettings
}

const legalLinks = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
]

export default function Footer({ settings }: Props) {
  const siteName = settings?.siteName || siteConfig.name
  const tagline = settings?.tagline || siteConfig.tagline
  const founder = settings?.founder || siteConfig.founder
  const phones = settings?.contact.phones || siteConfig.contact.phones
  const email = settings?.contact.email || siteConfig.contact.email
  const whatsappUrl = settings ? `https://wa.me/${settings.contact.whatsapp}` : siteConfig.contact.whatsappUrl
  const address = settings?.address || siteConfig.address
  const social = settings?.social || {}

  // lucide-react doesn't ship brand/logo icons in the version this project
  // uses, so social links show the platform name as text with a small arrow.
  const socialLinks = [
    { href: social.instagram, label: 'Instagram' },
    { href: social.facebook, label: 'Facebook' },
    { href: social.youtube, label: 'YouTube' },
    { href: social.twitter, label: 'Twitter / X' },
  ].filter((s) => s.href)

  return (
    <footer className="lux relative overflow-hidden border-t border-gilt-500/10 bg-ink-950">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[80%] rounded-full bg-gilt-500/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <span className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-gilt-300 to-gilt-600 text-ink-900">
                <span className="text-xl">🛕</span>
              </span>
              <div>
                <div className="font-display text-lg font-semibold text-white">{siteName}</div>
                <div className="text-xs tracking-wide text-gilt-400">{tagline}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/55 max-w-xs">
              Sacred yatras and curated holiday escapes across India — crafted with devotion, comfort and care for over 1000 happy travellers.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs text-white/70 hover:text-gilt-300 transition-colors"
                  >
                    {s.label}
                    <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.22em] text-gilt-400 mb-5">Explore</h3>
            <ul className="space-y-3 text-sm">
              {publicNavLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors">
                    {link.label === 'Tours' ? 'Upcoming Tours' : link.label}
                  </Link>
                </li>
              ))}
              <li><Link href="/blogs" className="text-white/60 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/faqs" className="text-white/60 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.22em] text-gilt-400 mb-5">Legal</h3>
            <ul className="space-y-3 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="text-xs uppercase tracking-[0.22em] text-gilt-400 mb-5">Get in touch</h3>
            <div className="space-y-3 text-sm">
              {phones.map((phone) => (
                <a key={phone} href={phoneHref(phone)} className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                  <span className="grid place-items-center w-8 h-8 rounded-full glass"><Phone size={13} className="text-gilt-300" /></span>
                  {phone}
                </a>
              ))}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                <span className="grid place-items-center w-8 h-8 rounded-full glass"><MessageCircle size={13} className="text-emerald-300" /></span>
                WhatsApp Us
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                <span className="grid place-items-center w-8 h-8 rounded-full glass"><Mail size={13} className="text-gilt-300" /></span>
                {email}
              </a>
              <div className="flex items-start gap-3 text-white/60">
                <span className="grid place-items-center w-8 h-8 rounded-full glass shrink-0"><MapPin size={13} className="text-gilt-300" /></span>
                <span className="pt-1.5">{address.line1}<br />{address.line2}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <span>Crafted with devotion · {founder}</span>
        </div>
      </div>
    </footer>
  )
}
