import { Calendar, Users, BookOpen, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import connectDB from '@/lib/mongodb'
import Tour from '@/models/Tour'
import Booking from '@/models/Booking'
import Link from 'next/link'

async function getStats() {
  try {
    await connectDB()
    const [totalTours, upcomingTours, totalBookings, pendingBookings] = await Promise.all([
      Tour.countDocuments(),
      Tour.countDocuments({ status: 'upcoming' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
    ])
    const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5).lean()
    return { totalTours, upcomingTours, totalBookings, pendingBookings, recentBookings }
  } catch {
    return { totalTours: 0, upcomingTours: 0, totalBookings: 0, pendingBookings: 0, recentBookings: [] }
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Tours', value: stats.totalTours, icon: <Calendar className="text-orange-600" size={24} />, sub: `${stats.upcomingTours} upcoming`, href: '/admin/tours' },
          { title: 'Total Bookings', value: stats.totalBookings, icon: <BookOpen className="text-blue-600" size={24} />, sub: `${stats.pendingBookings} pending`, href: '/admin/bookings' },
          { title: 'Pending Approvals', value: stats.pendingBookings, icon: <Users className="text-amber-600" size={24} />, sub: 'Need attention', href: '/admin/bookings' },
          { title: 'Upcoming Yatras', value: stats.upcomingTours, icon: <TrendingUp className="text-green-600" size={24} />, sub: 'Active tours', href: '/admin/tours' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">{stat.title}</span>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.sub}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((b: any) => (
                <div key={b._id.toString()} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-medium text-sm text-gray-800">{b.name}</div>
                    <div className="text-xs text-gray-500">{b.tourTitle} • {b.numPersons} person(s)</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{b.status}</div>
                    <div className="text-xs text-gray-400 mt-1">{b.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
