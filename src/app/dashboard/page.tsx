'use client'
import Link from 'next/link'
import { useState } from 'react'
import { CalendarClock, ClipboardList, Bell, ArrowRight, Package as PackageIcon, Wallet } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useAuth } from '@/hooks/useAuth'
import { deriveNotifications } from '@/features/dashboard/lib/notifications'
import { bookingStatusMeta, statusBadge } from '@/config/registration-status'
import type { Registration } from '@/types'

const toneClass: Record<string, string> = {
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
}

export default function DashboardOverviewPage() {
  const { user } = useAuth()
  const { data: registrations, loading } = useFetch<Registration[]>('/api/registrations/mine', [])
  const [now] = useState(() => Date.now())

  const upcoming = registrations
    .filter((r) => r.status === 'confirmed' && new Date(r.travelDate).getTime() >= now)
    .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
    .slice(0, 5)

  const notifications = deriveNotifications(registrations).slice(0, 6)
  const pendingCount = registrations.filter((r) => r.status === 'pending_payment').length

  const stats = [
    { icon: PackageIcon, value: registrations.length, label: 'Total Bookings', gold: false },
    { icon: CalendarClock, value: upcoming.length, label: 'Upcoming Trips', gold: false },
    { icon: Wallet, value: pendingCount, label: 'Pending Payment', gold: true },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-semibold text-white">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-1 text-white/55">Here&apos;s what&apos;s happening with your trips.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl glass gilt-border p-6">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-gilt-400/15 text-gilt-300"><s.icon size={18} /></span>
            <div className={`mt-4 font-display text-3xl font-semibold ${s.gold ? 'gilt-text' : 'text-white'}`}>{s.value}</div>
            <div className="mt-1 text-sm text-white/50">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl glass gilt-border p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2"><CalendarClock size={18} className="text-gilt-300" /> Upcoming Trips</h2>
          <Link href="/dashboard/bookings" className="text-xs text-gilt-300 flex items-center gap-1 hover:underline">View all <ArrowRight size={12} /></Link>
        </div>
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-white/40">No upcoming confirmed trips yet.</p>
        ) : (
          <div className="space-y-1">
            {upcoming.map((r) => (
              <Link key={r._id} href={`/dashboard/bookings/${r._id}`} className="flex items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.03] -mx-3 px-3 rounded-xl transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white line-clamp-1">{r.packageTitle}</div>
                  <div className="text-xs text-white/40">{new Date(r.travelDate).toLocaleDateString('en-IN')} · {r.numPersons} person(s)</div>
                </div>
                <span className={statusBadge(bookingStatusMeta[r.status]).className}>{bookingStatusMeta[r.status].label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl glass gilt-border p-7">
        <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2 mb-5"><Bell size={18} className="text-gilt-300" /> Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-white/40">No notifications right now.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`text-sm border rounded-xl px-4 py-2.5 ${toneClass[n.tone]}`}>{n.message}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/packages" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-6 py-3 text-sm font-semibold text-ink-900 gilt-glow"><ClipboardList size={15} /> Browse Packages</Link>
        <Link href="/dashboard/bookings" className="inline-flex items-center gap-2 rounded-full glass gilt-border px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors">View All Bookings</Link>
      </div>
    </div>
  )
}
