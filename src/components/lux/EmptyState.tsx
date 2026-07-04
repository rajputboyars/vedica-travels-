import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

// Shared premium empty-state block for "no results / nothing yet" across
// listings, dashboard and admin.
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl glass gilt-border px-6 py-16 text-center">
      <span className="grid place-items-center w-16 h-16 rounded-2xl bg-gilt-400/10 border border-gilt-500/20 text-gilt-300">
        <Icon size={26} />
      </span>
      <h3 className="mt-5 font-display text-xl font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-white/55">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-6 py-3 text-sm font-semibold text-ink-900 gilt-glow"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
