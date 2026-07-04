import Reveal from './Reveal'

// Shared luxury section header: a gilded eyebrow label, a large serif
// title (with an optional gold-gradient highlight word) and a muted
// subtitle. Keeps every home section visually consistent.
export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
}: {
  eyebrow: string
  title: string
  highlight?: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  const alignment = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start'
  return (
    <Reveal className={`flex flex-col ${alignment} max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gilt-400">
        <span className="h-px w-6 bg-gilt-500/50" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] font-semibold text-white">
        {title} {highlight && <span className="gilt-text">{highlight}</span>}
      </h2>
      {subtitle && <p className="mt-4 text-white/55 leading-relaxed">{subtitle}</p>}
    </Reveal>
  )
}
