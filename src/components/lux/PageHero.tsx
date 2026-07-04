import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import Reveal from '@/features/home/components/Reveal'

export interface Crumb {
  label: string
  href?: string
}

const DEFAULT_BG = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop'

// Shared premium banner used at the top of every non-home page, so each
// route opens with the same dark cinematic hero + breadcrumb the homepage
// established. Keeps title/eyebrow/description/breadcrumb consistent.
export default function PageHero({
  title,
  highlight,
  eyebrow,
  description,
  image = DEFAULT_BG,
  crumbs = [],
  compact = false,
}: {
  title: string
  highlight?: string
  eyebrow?: string
  description?: string
  image?: string
  crumbs?: Crumb[]
  compact?: boolean
}) {
  const allCrumbs: Crumb[] = [{ label: 'Home', href: '/' }, ...crumbs]
  return (
    <section className={`relative overflow-hidden px-6 ${compact ? 'pt-28 pb-12 lg:pt-32 lg:pb-14' : 'pt-32 pb-16 lg:pt-40 lg:pb-24'}`}>
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/75 to-ink-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 to-transparent" />
      <div className="aura absolute inset-0" />

      <div className="relative max-w-7xl mx-auto">
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-white/55">
            {allCrumbs.map((c, i) => {
              const last = i === allCrumbs.length - 1
              return (
                <span key={i} className="flex items-center gap-1.5">
                  {c.href && !last ? (
                    <Link href={c.href} className="hover:text-gilt-300 transition-colors">{c.label}</Link>
                  ) : (
                    <span className={last ? 'text-gilt-300' : ''}>{c.label}</span>
                  )}
                  {!last && <ChevronRight size={14} className="text-white/30" />}
                </span>
              )
            })}
          </nav>
        </Reveal>

        {eyebrow && (
          <Reveal delay={60}>
            <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gilt-400">
              <span className="h-px w-6 bg-gilt-500/50" /> {eyebrow}
            </span>
          </Reveal>
        )}

        <Reveal delay={100}>
          <h1 className={`mt-4 font-display font-semibold text-white leading-[1.05] ${compact ? 'text-4xl sm:text-5xl' : 'text-4xl sm:text-5xl lg:text-6xl'}`}>
            {title} {highlight && <span className="gilt-text">{highlight}</span>}
          </h1>
        </Reveal>

        {description && (
          <Reveal delay={160}>
            <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-white/60">{description}</p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
