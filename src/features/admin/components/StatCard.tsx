import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

// Premium dark-glass metric card for the admin dashboard.
export default function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  href,
  accent = false,
}: {
  title: string
  value: number | string
  icon: LucideIcon
  sub: string
  href: string
  accent?: boolean
}) {
  return (
    <Link href={href} className="hover-lift group block rounded-3xl glass gilt-border p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/55">{title}</span>
        <span className={`grid place-items-center w-10 h-10 rounded-xl transition-transform duration-500 group-hover:scale-105 ${accent ? 'bg-gilt-400/15 text-gilt-300' : 'bg-white/[0.05] text-white/70'}`}>
          <Icon size={20} />
        </span>
      </div>
      <div className={`mt-4 font-display text-3xl font-semibold ${accent ? 'gilt-text' : 'text-white'}`}>{value}</div>
      <div className="mt-1 text-xs text-white/40">{sub}</div>
    </Link>
  )
}
