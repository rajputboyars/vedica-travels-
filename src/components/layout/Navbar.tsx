'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Phone, LogIn, User as UserIcon } from 'lucide-react'
import { siteConfig, phoneHref } from '@/config/site'
import { publicNavLinks } from '@/config/nav'
import { useAuth } from '@/hooks/useAuth'
import type { SiteSettings } from '@/types'

interface Props {
  // Phase 10 CMS -- passed down from the (public) layout's
  // getSiteSettings() call. Optional so this component still renders
  // sensibly (falling back to config/site.ts) if ever used without a
  // wrapping layout -- e.g. in isolation/tests.
  settings?: SiteSettings
}

export default function Navbar({ settings }: Props) {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()

  const shortName = settings?.shortName || siteConfig.shortName
  const emoji = siteConfig.emoji
  const primaryPhone = settings?.contact.primaryPhone || siteConfig.contact.primaryPhone

  return (
    <nav className="bg-gradient-to-r from-orange-700 via-orange-600 to-amber-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">{emoji}</span>
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">{shortName}</div>
              <div className="text-xs text-orange-200 leading-tight">Travels</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {publicNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-orange-200 transition-colors">
                {link.label}
              </Link>
            ))}
            <a
              href={phoneHref(primaryPhone)}
              className="flex items-center gap-1 bg-white text-orange-700 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              <Phone size={14} />
              {primaryPhone}
            </a>
            {!loading && user?.role === 'customer' ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1 border border-white/70 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-white hover:text-orange-700 transition-colors"
              >
                <UserIcon size={14} />
                {user.name.split(' ')[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 border border-white/70 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-white hover:text-orange-700 transition-colors"
              >
                <LogIn size={14} />
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-orange-700 border-t border-orange-500 px-4 py-4 space-y-3 text-sm font-medium">
          {publicNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block hover:text-orange-200" onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href={phoneHref(primaryPhone)} className="flex items-center gap-1 text-orange-200">
            <Phone size={14} /> {primaryPhone}
          </a>
          {!loading && user?.role === 'customer' ? (
            <Link href="/dashboard" className="flex items-center gap-1 hover:text-orange-200" onClick={() => setOpen(false)}>
              <UserIcon size={14} /> {user.name.split(' ')[0]}
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1 hover:text-orange-200" onClick={() => setOpen(false)}>
              <LogIn size={14} /> Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
