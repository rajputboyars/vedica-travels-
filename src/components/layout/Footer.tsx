import Link from 'next/link'
import { Phone, MapPin, MessageCircle, Globe } from 'lucide-react'
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
  const emoji = siteConfig.emoji
  const phones = settings?.contact.phones || siteConfig.contact.phones
  const whatsappUrl = settings ? `https://wa.me/${settings.contact.whatsapp}` : siteConfig.contact.whatsappUrl
  const address = settings?.address || siteConfig.address
  const happyTravellers = settings?.stats.happyTravellers || siteConfig.stats.happyTravellers
  const social = settings?.social || {}

  // lucide-react doesn't ship brand/logo icons (Instagram, Facebook, etc.)
  // in the version this project uses, so social links use one generic
  // "Globe" icon plus the platform name as text rather than pulling in a
  // separate brand-icon package for four small links.
  const socialLinks = [
    { href: social.instagram, label: 'Instagram' },
    { href: social.facebook, label: 'Facebook' },
    { href: social.youtube, label: 'YouTube' },
    { href: social.twitter, label: 'Twitter / X' },
  ].filter((s) => s.href)

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{emoji}</span>
            <div>
              <div className="text-white font-bold text-lg">{siteName}</div>
              <div className="text-orange-400 text-xs">{tagline}</div>
            </div>
          </div>
          <p className="text-sm text-gray-400">{happyTravellers} संतुष्ट तीर्थयात्री। हमारे साथ पवित्र धामों की यात्रा करें।</p>
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-400 transition-colors">
                  <Globe size={14} /> {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {publicNavLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-orange-400 transition-colors">
                  {link.label === 'Tours' ? 'Upcoming Tours' : link.label}
                </Link>
              </li>
            ))}
            <li><Link href="/blogs" className="hover:text-orange-400 transition-colors">Blogs</Link></li>
            <li><Link href="/faqs" className="hover:text-orange-400 transition-colors">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm">
            {phones.map((phone) => (
              <a key={phone} href={phoneHref(phone)} className="flex items-center gap-2 hover:text-orange-400">
                <Phone size={14} /> {phone}
              </a>
            ))}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400">
              <MessageCircle size={14} /> WhatsApp Us
            </a>
            <div className="flex items-start gap-2 text-gray-400">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span>{address.line1}<br />{address.line2}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-orange-400 transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {siteName}. All rights reserved. | {founder}
      </div>
    </footer>
  )
}
