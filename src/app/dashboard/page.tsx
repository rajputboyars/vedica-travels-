'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarClock, ClipboardList, Bell, ArrowRight } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'
import { useAuth } from '@/hooks/useAuth'
import { deriveNotifications } from '@/features/dashboard/lib/notifications'
import { bookingStatusMeta, statusBadge } from '@/config/registration-status'
import type { Registration } from '@/types'

const toneClass: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  success: 'bg-green-50 text-green-700 border-green-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
}

export default function DashboardOverviewPage() {
  const { user } = useAuth()
  const { data: registrations, loading } = useFetch<Registration[]>('/api/registrations/mine', [])
  // Date.now() is impure -- reading it directly in the render body trips
  // the react-hooks/purity rule. A useState lazy initializer only ever
  // runs once (on mount), which is the sanctioned way to snapshot "now"
  // for a page like this that doesn't need to tick live.
  const [now] = useState(() => Date.now())

  const upcoming = registrations
    .filter((r) => r.status === 'confirmed' && new Date(r.travelDate).getTime() >= now)
    .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
    .slice(0, 5)

  const notifications = deriveNotifications(registrations).slice(0, 6)
  const pendingCount = registrations.filter((r) => r.status === 'pending_payment').length

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm">Here&apos;s what&apos;s happening with your trips</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{registrations.length}</div>
            <div className="text-xs text-gray-500">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-800">{upcoming.length}</div>
            <div className="text-xs text-gray-500">Upcoming Trips</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            <div className="text-xs text-gray-500">Pending Payment</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><CalendarClock size={18} className="text-orange-600" /> Upcoming Trips</CardTitle>
          <Link href="/dashboard/bookings" className="text-xs text-orange-600 flex items-center gap-1 hover:underline">View all <ArrowRight size={12} /></Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming confirmed trips yet.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((r) => (
                <Link key={r._id} href={`/dashboard/bookings/${r._id}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{r.packageTitle}</div>
                    <div className="text-xs text-gray-400">{new Date(r.travelDate).toLocaleDateString('en-IN')} · {r.numPersons} person(s)</div>
                  </div>
                  <span className={statusBadge(bookingStatusMeta[r.status]).className}>{bookingStatusMeta[r.status].label}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bell size={18} className="text-orange-600" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400">No notifications right now.</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className={`text-sm border rounded-lg px-3 py-2 ${toneClass[n.tone]}`}>{n.message}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/packages"><Button variant="outline"><ClipboardList size={15} className="mr-1" /> Browse Packages</Button></Link>
        <Link href="/dashboard/bookings"><Button variant="outline">View All Bookings</Button></Link>
      </div>
    </div>
  )
}
