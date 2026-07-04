import Link from 'next/link'
import { Calendar, Users, IndianRupee, Clock, CheckCircle2, UserCheck, Armchair, ArrowRight } from 'lucide-react'
import StatCard from '@/features/admin/components/StatCard'
import { AdminHeader, Panel } from '@/features/admin/components/ui'
import BarChart from '@/components/ui/charts/BarChart'
import { getDashboardOverview } from '@/services/dashboard.service'
import { packageCategoryMeta } from '@/config/package-theme'

export const dynamic = 'force-dynamic'

// Phase 8 — professional admin overview, composed entirely from existing
// services (dashboard.service.ts); this page has no business logic of its
// own, just layout.
export default async function AdminDashboard() {
  const overview = await getDashboardOverview()
  const revenueBars = overview.revenue.trend.map((t) => ({
    label: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    value: t.amount,
  }))

  const statusChip = (status: string) =>
    status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-300'
    : status === 'cancelled' ? 'bg-rose-500/15 text-rose-300'
    : 'bg-amber-500/15 text-amber-300'

  return (
    <div className="space-y-8">
      <AdminHeader title="Dashboard" description="Welcome back! Here's what's happening across Tours, Packages, and Registrations." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Today's Bookings" value={overview.todaysBookingsCount} icon={Calendar} sub="New registrations today" href="/admin/registrations" />
        <StatCard title="Revenue Collected" value={`₹${overview.revenue.total.toLocaleString()}`} icon={IndianRupee} sub="Manually verified payments" href="/admin/registrations" accent />
        <StatCard title="Pending Payments" value={overview.pendingPayments} icon={Clock} sub="Awaiting customer payment" href="/admin/registrations" />
        <StatCard title="Pending Approvals" value={overview.pendingApprovals} icon={CheckCircle2} sub="Screenshots to verify" href="/admin/registrations" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Revenue — last 14 days" className="lg:col-span-2">
          {overview.revenue.trend.every((t) => t.amount === 0) ? (
            <p className="text-white/40 text-sm text-center py-10">No verified payments yet in this window</p>
          ) : (
            <BarChart data={revenueBars} color="#e6c05c" axisColor="rgba(255,255,255,0.12)" labelColor="rgba(255,255,255,0.4)" format="inr" />
          )}
        </Panel>

        <Panel title="Package Statistics">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Total packages</span>
              <span className="font-semibold text-white">{overview.packageStats.total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Archived</span>
              <span className="font-semibold text-white">{overview.packageStats.archived}</span>
            </div>
            <div className="pt-3 border-t border-white/5 space-y-2">
              {Object.entries(overview.packageStats.byCategory).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-white/50">{packageCategoryMeta[cat as keyof typeof packageCategoryMeta]?.emoji} {packageCategoryMeta[cat as keyof typeof packageCategoryMeta]?.label ?? cat}</span>
                  <span className="font-medium text-white/80">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Upcoming Trips">
          {overview.upcomingTrips.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No confirmed upcoming trips</p>
          ) : (
            <div className="space-y-1">
              {overview.upcomingTrips.map((r) => (
                <div key={r._id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white truncate">{r.packageTitle}</div>
                    <div className="text-xs text-white/45">{r.name} · {r.numPersons} person(s)</div>
                  </div>
                  <div className="text-xs text-white/45 shrink-0 ml-2">{new Date(r.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Recent Registrations">
          {overview.recentRegistrations.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No registrations yet</p>
          ) : (
            <div className="space-y-1">
              {overview.recentRegistrations.map((r) => (
                <div key={r._id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white truncate">{r.name}</div>
                    <div className="text-xs text-white/45 truncate">{r.packageTitle} · {r.numPersons} person(s)</div>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-2 capitalize ${statusChip(r.status)}`}>{r.status.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title={<span className="flex items-center gap-2"><Armchair size={16} className="text-gilt-300" /> Seat Availability</span>}>
          {overview.seatAvailability.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No packages yet</p>
          ) : (
            <div className="space-y-3">
              {overview.seatAvailability.map((s) => (
                <div key={s.packageId} className="py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-white truncate">{s.packageTitle}</span>
                    <span className="text-xs text-white/45 shrink-0 ml-2">{s.availableSeats}/{s.totalSeats} left</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gilt-400 to-gilt-500 rounded-full" style={{ width: `${s.totalSeats ? Math.min(100, (s.bookedSeats / s.totalSeats) * 100) : 0}%` }} />
                  </div>
                  {s.waitingListCount > 0 && <div className="text-xs text-violet-300 mt-1">{s.waitingListCount} on waiting list ({s.waitingListPersons} persons)</div>}
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><UserCheck size={16} className="text-gilt-300" /> Recent Customers</span>}>
          {overview.recentCustomers.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">No customers yet</p>
          ) : (
            <div className="space-y-1">
              {overview.recentCustomers.map((c) => (
                <div key={c.email} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white truncate">{c.name}</div>
                    <div className="text-xs text-white/45 truncate">{c.mobile} · {c.email}</div>
                  </div>
                  <div className="text-xs text-white/40 shrink-0 ml-2 flex items-center gap-1"><Users size={11} /> {c.totalBookings}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/admin/customers" className="text-sm text-gilt-300 hover:underline flex items-center gap-1.5"><Users size={14} /> Search Customers <ArrowRight size={13} /></Link>
        <Link href="/admin/registrations" className="text-sm text-gilt-300 hover:underline flex items-center gap-1.5"><CheckCircle2 size={14} /> Manage Registrations <ArrowRight size={13} /></Link>
      </div>
    </div>
  )
}
