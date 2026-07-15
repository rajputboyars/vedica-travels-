import type { LucideIcon } from 'lucide-react'
import BarChart from '@/components/ui/charts/BarChart'
import { expenseCategoryMeta } from '@/types'
import type { TripFinanceSummary } from '@/types'

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

// One metric card (matches the admin StatCard look, but non-linking so it
// composes into grids inside the finance dashboard).
export function Metric({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  tone?: 'default' | 'gold' | 'positive' | 'negative'
}) {
  const valueClass =
    tone === 'gold' ? 'gilt-text'
    : tone === 'positive' ? 'text-emerald-300'
    : tone === 'negative' ? 'text-rose-300'
    : 'text-white'
  return (
    <div className="rounded-3xl glass gilt-border p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/55">{label}</span>
        {Icon && <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/[0.05] text-white/70"><Icon size={17} /></span>}
      </div>
      <div className={`mt-3 font-display text-2xl sm:text-3xl font-semibold ${valueClass}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-white/40">{sub}</div>}
    </div>
  )
}

// Horizontal percentage bar with a label + right-aligned value.
export function ProgressStat({ label, value, pct, tone = 'gold' }: { label: string; value: string; pct: number; tone?: 'gold' | 'emerald' | 'sky' }) {
  const barClass = tone === 'emerald' ? 'from-emerald-400 to-emerald-500' : tone === 'sky' ? 'from-sky-400 to-sky-500' : 'from-gilt-400 to-gilt-500'
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${barClass}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  )
}

// Expense category breakdown as labelled bars.
export function CategoryBreakdown({ summary }: { summary: TripFinanceSummary }) {
  const max = Math.max(1, ...summary.categoryBreakdown.map((c) => c.amount))
  if (summary.categoryBreakdown.length === 0) return <p className="text-sm text-white/40 py-4 text-center">No expenses yet</p>
  return (
    <div className="space-y-3">
      {summary.categoryBreakdown.map((c) => (
        <div key={c.category}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white/60">{expenseCategoryMeta[c.category].label}</span>
            <span className="font-medium text-white/80">{inr(c.amount)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-gilt-400 to-gilt-500" style={{ width: `${(c.amount / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Revenue vs total expenses, using the existing SVG BarChart.
export function RevenueVsExpenses({ summary }: { summary: TripFinanceSummary }) {
  return (
    <BarChart
      data={[
        { label: 'Revenue', value: summary.totalRevenue },
        { label: 'Expenses', value: summary.totalExpenses },
        { label: 'Collected', value: summary.collectedAmount },
      ]}
      color="#e6c05c"
      axisColor="rgba(255,255,255,0.12)"
      labelColor="rgba(255,255,255,0.45)"
      format="inr"
    />
  )
}

// Break-even callout.
export function BreakEvenCard({ summary }: { summary: TripFinanceSummary }) {
  const { breakEvenPassengers, breakEvenReached, confirmedPassengers } = summary
  if (breakEvenPassengers === null) {
    return (
      <div className="rounded-3xl glass gilt-border p-6">
        <div className="text-xs uppercase tracking-wider text-gilt-400">Break-even</div>
        <p className="mt-3 text-white/70 leading-relaxed">
          At this price the per-passenger margin doesn&apos;t cover variable costs, so fixed costs can&apos;t be recovered.
          Raise the price or reduce per-head costs.
        </p>
      </div>
    )
  }
  const remaining = Math.max(0, breakEvenPassengers - confirmedPassengers)
  return (
    <div className="rounded-3xl glass gilt-border p-6">
      <div className="text-xs uppercase tracking-wider text-gilt-400">Break-even</div>
      {breakEvenReached ? (
        <p className="mt-3 text-white/80 leading-relaxed">
          <span className="gilt-text font-display text-2xl font-semibold">Break-even reached</span><br />
          All costs are covered — every additional passenger is profit.
        </p>
      ) : (
        <p className="mt-3 text-white/80 leading-relaxed">
          Need only <span className="gilt-text font-display text-2xl font-semibold">{breakEvenPassengers}</span> passengers to recover all costs.
          <br />
          <span className="text-white/55 text-sm">{confirmedPassengers} confirmed · {remaining} more to break even.</span>
        </p>
      )}
      <div className="mt-4">
        <ProgressStat label="Progress to break-even" value={`${confirmedPassengers}/${breakEvenPassengers}`} pct={(confirmedPassengers / breakEvenPassengers) * 100} />
      </div>
    </div>
  )
}
