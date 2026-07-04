import Link from 'next/link'
import { Calendar, Users, IndianRupee, Clock, CheckCircle2, UserCheck, Package as PackageIcon, Armchair } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import StatCard from '@/features/admin/components/StatCard'
import BarChart from '@/components/ui/charts/BarChart'
import { getDashboardOverview } from '@/services/dashboard.service'
import { packageCategoryMeta } from '@/config/package-theme'

export const dynamic = 'force-dynamic'

// Phase 8 — professional admin overview: today's bookings, upcoming
// trips, revenue (manual — no payment gateway, see dashboard.service.ts),
// pending payments/approvals, recent registrations/customers, seat
// availability per package, and package statistics. Everything here is
// composed from existing services (dashboard.service.ts), so this page
// itself has no business logic of its own — just layout.
export default async function AdminDashboard() {
  const overview = await getDashboardOverview()
  const revenueBars = overview.revenue.trend.map((t) => ({
    label: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    value: t.amount,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here&apos;s what&apos;s happening across Tours, Packages, and Registrations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Bookings" value={overview.todaysBookingsCount} icon={<Calendar className="text-orange-600" size={24} />} sub="New registrations today" href="/admin/registrations" />
        <StatCard title="Revenue Collected" value={`₹${overview.revenue.total.toLocaleString()}`} icon={<IndianRupee className="text-green-600" size={24} />} sub="Manually verified payments" href="/admin/registrations" />
        <StatCard title="Pending Payments" value={overview.pendingPayments} icon={<Clock className="text-amber-600" size={24} />} sub="Awaiting customer payment" href="/admin/registrations" />
        <StatCard title="Pending Approvals" value={overview.pendingApprovals} icon={<CheckCircle2 className="text-blue-600" size={24} />} sub="Screenshots to verify" href="/admin/registrations" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.revenue.trend.every((t) => t.amount === 0) ? (
              <p className="text-gray-400 text-sm text-center py-8">No verified payments yet in this window</p>
            ) : (
              <BarChart data={revenueBars} valueFormatter={(v) => `₹${v.toLocaleString()}`} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Package Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total packages</span>
              <span className="font-semibold text-gray-800">{overview.packageStats.total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Archived</span>
              <span className="font-semibold text-gray-800">{overview.packageStats.archived}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              {Object.entries(overview.packageStats.byCategory).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{packageCategoryMeta[cat as keyof typeof packageCategoryMeta]?.emoji} {packageCategoryMeta[cat as keyof typeof packageCategoryMeta]?.label ?? cat}</span>
                  <span className="font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.upcomingTrips.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No confirmed upcoming trips</p>
            ) : (
              <div className="space-y-3">
                {overview.upcomingTrips.map((r) => (
                  <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{r.packageTitle}</div>
                      <div className="text-xs text-gray-500">{r.name} · {r.numPersons} person(s)</div>
                    </div>
                    <div className="text-xs text-gray-500 shrink-0 ml-2">
                      {new Date(r.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.recentRegistrations.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No registrations yet</p>
            ) : (
              <div className="space-y-3">
                {overview.recentRegistrations.map((r) => (
                  <div key={r._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{r.name}</div>
                      <div className="text-xs text-gray-500 truncate">{r.packageTitle} · {r.numPersons} person(s)</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ml-2 ${
                      r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      r.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{r.status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Armchair size={16} /> Seat Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.seatAvailability.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No packages yet</p>
            ) : (
              <div className="space-y-3">
                {overview.seatAvailability.map((s) => (
                  <div key={s.packageId} className="py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 truncate">{s.packageTitle}</span>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{s.availableSeats}/{s.totalSeats} left</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${s.totalSeats ? Math.min(100, (s.bookedSeats / s.totalSeats) * 100) : 0}%` }}
                      />
                    </div>
                    {s.waitingListCount > 0 && (
                      <div className="text-xs text-purple-600 mt-1">{s.waitingListCount} on waiting list ({s.waitingListPersons} persons)</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UserCheck size={16} /> Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.recentCustomers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No customers yet</p>
            ) : (
              <div className="space-y-3">
                {overview.recentCustomers.map((c) => (
                  <div key={c.email} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">{c.name}</div>
                      <div className="text-xs text-gray-500 truncate">{c.mobile} · {c.email}</div>
                    </div>
                    <div className="text-xs text-gray-400 shrink-0 ml-2 flex items-center gap-1">
                      <Users size={11} /> {c.totalBookings}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/customers" className="text-sm text-orange-600 hover:underline flex items-center gap-1"><Users size={14} /> Search Customers</Link>
        <Link href="/admin/registrations" className="text-sm text-orange-600 hover:underline flex items-center gap-1"><PackageIcon size={14} /> Search Bookings</Link>
      </div>
    </div>
  )
}
