'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Phone, ArrowRight, User as UserIcon } from 'lucide-react'
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
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Home page has a full-bleed dark hero, so the navbar floats transparently
  // over it (fixed) and darkens on scroll. Every other public page has light
  // content at the top, so the bar stays in-flow (sticky) and always solid
  // to avoid overlapping / low-contrast issues on pages not yet redesigned.
  const overHero = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const shortName = settings?.shortName || siteConfig.shortName
  const primaryPhone = settings?.contact.primaryPhone || siteConfig.contact.primaryPhone

  const solid = scrolled || !overHero
  const account = !loading && user?.role === 'customer'

  return (
    <>
      <header
        className={[
          overHero ? 'fixed' : 'sticky',
          'top-0 inset-x-0 z-50 transition-all duration-500',
          solid ? 'glass-strong shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)] py-2.5' : 'bg-transparent py-4',
        ].join(' ')}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
            <span className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-br from-gilt-300 to-gilt-600 text-ink-900 shadow-[0_6px_20px_-6px_rgba(212,175,55,0.7)] transition-transform duration-500 group-hover:scale-105">
              <span className="text-xl">🛕</span>
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-semibold tracking-wide text-white">{shortName}</span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-gilt-400">Travels</span>
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden lg:flex items-center gap-1 glass rounded-full px-2 py-1.5">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  pathname === link.href ? 'text-ink-900 bg-gilt-400' : 'text-white/75 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={phoneHref(primaryPhone)}
              className="flex items-center gap-2 text-sm text-white/85 hover:text-gilt-300 transition-colors"
            >
              <span className="grid place-items-center w-9 h-9 rounded-full glass gilt-border">
                <Phone size={14} className="text-gilt-300" />
              </span>
              <span className="font-medium tracking-wide">{primaryPhone}</span>
            </a>
            {account ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition-colors"
              >
                <UserIcon size={15} className="text-gilt-300" /> {user!.name.split(' ')[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-white/10 border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition-colors"
              >
                Login / Register
              </Link>
            )}
            <Link
              href="/tours"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-5 py-2.5 text-sm font-semibold text-ink-900 gilt-glow transition-all"
            >
              Book Now
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden grid place-items-center w-11 h-11 rounded-full glass text-white"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm glass-strong border-l border-gilt-500/15 px-6 py-6 flex flex-col transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-lg font-semibold text-white">{shortName}</span>
            <button className="grid place-items-center w-10 h-10 rounded-full glass text-white" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  pathname === link.href ? 'bg-gilt-400 text-ink-900' : 'text-white/80 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <a href={phoneHref(primaryPhone)} className="flex items-center gap-3 rounded-xl glass px-4 py-3 text-white/90">
              <Phone size={16} className="text-gilt-300" /> {primaryPhone}
            </a>
            {account ? (
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white font-medium">
                <UserIcon size={16} className="text-gilt-300" /> {user!.name.split(' ')[0]}
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block text-center rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white font-medium">
                Login / Register
              </Link>
            )}
            <Link
              href="/tours"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gilt-300 to-gilt-500 px-4 py-3 font-semibold text-ink-900"
            >
              Book Now <ArrowRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
