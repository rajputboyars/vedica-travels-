import * as React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Shared admin design-system primitives. Every admin page composes these so
// the panel stays visually consistent (dark glass, gold accent) without each
// page re-declaring the same Tailwind. Purely presentational — no data logic.
// ---------------------------------------------------------------------------

// Shared control styling (dark glass) for inline <select>/<input> filters.
export const adminControl =
  'rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-sm text-white/90 ' +
  'transition-colors focus:outline-none focus:border-gilt-400/60 focus:ring-2 focus:ring-gilt-500/15 ' +
  '[&>option]:bg-ink-800 [&>option]:text-white disabled:opacity-50'

// Field label for dark admin forms.
export const luxLabel = 'block text-sm font-medium text-white/70 mb-1.5'

// Table class tokens (SaaS-style dark table).
export const tableWrap = 'overflow-x-auto rounded-3xl glass gilt-border'
export const tableCls = 'w-full text-sm min-w-[560px]'
export const theadCls = 'text-left text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.03] border-b border-white/10'
export const thCls = 'px-5 py-3.5 font-medium'
export const tdCls = 'px-5 py-4'
export const rowCls = 'border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors'

// Button tokens.
export const primaryBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-5 py-2.5 text-sm font-semibold text-ink-900 gilt-glow transition-all disabled:opacity-60'
export const ghostBtn =
  'inline-flex items-center justify-center gap-1.5 rounded-full glass gilt-border px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50'
export const iconBtn =
  'grid place-items-center w-9 h-9 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40'
export const dangerIconBtn =
  'grid place-items-center w-9 h-9 rounded-lg text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-300 transition-colors disabled:opacity-40'

// Page header: title + description + optional right-aligned actions.
export function AdminHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  )
}

// Glass content panel with an optional title bar.
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <div className={cn('rounded-3xl glass gilt-border p-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-5">
          {title && <h2 className="text-base font-medium text-white">{title}</h2>}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  )
}

// Primary link-button (e.g. "Add Package").
export function PrimaryLink({ href, icon: Icon, children }: { href: string; icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <Link href={href} className={primaryBtn}>
      {Icon && <Icon size={16} />} {children}
    </Link>
  )
}

// Loading + empty helpers for tables/lists.
export function AdminLoading({ label = 'Loading…' }: { label?: string }) {
  return <div className="text-center py-16 text-white/40">{label}</div>
}
