import { isDBConfigured } from '@/config/env'
import { DEMO_TOURS } from '@/lib/demo/tours'
import { getBookings } from '@/lib/demo/bookings'
import type { Booking } from '@/types'
import { serialize } from './serialize'

export interface DashboardStats {
  totalTours: number
  upcomingTours: number
  totalBookings: number
  pendingBookings: number
  recentBookings: Booking[]
}

// Extracted from the admin dashboard page so the "how do we compute these
// numbers" logic is testable and reusable independent of the React tree.
export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isDBConfigured) {
    const bookings = getBookings()
    return {
      totalTours: DEMO_TOURS.length,
      upcomingTours: DEMO_TOURS.filter((t) => t.status === 'upcoming').length,
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
      recentBookings: bookings.slice(0, 5),
    }
  }
  try {
    const { default: connectDB } = await import('@/lib/db')
    const { default: Tour } = await import('@/models/Tour')
    const { default: Booking } = await import('@/models/Booking')
    await connectDB()
    const [totalTours, upcomingTours, totalBookings, pendingBookings] = await Promise.all([
      Tour.countDocuments(),
      Tour.countDocuments({ status: 'upcoming' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
    ])
    const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5)
    return { totalTours, upcomingTours, totalBookings, pendingBookings, recentBookings: serialize(recentBookings) }
  } catch {
    return { totalTours: 0, upcomingTours: 0, totalBookings: 0, pendingBookings: 0, recentBookings: [] }
  }
}
