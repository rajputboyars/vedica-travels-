// Phase 8 — Admin Overview. Deliberately does not touch MongoDB/demo
// stores directly: every number here is composed from the existing
// tour/booking/package/registration services, so this file can't drift
// out of sync with "what a registration/booking/package actually is" —
// there's exactly one definition of each, reused here.
import { listRegistrations } from './registration.service'
import { getSeatSummary, type SeatSummary } from './registration.service'
import { listPackages } from './package.service'
import { listBookings } from './booking.service'
import type { Registration, Package, PackageCategory, PackageStatus } from '@/types'

export interface RecentCustomer {
  name: string
  email: string
  mobile: string
  lastBookingAt: string
  totalBookings: number
}

export interface RevenuePoint {
  date: string
  amount: number
}

export interface PackageSeatRow extends SeatSummary {
  packageId: string
  packageTitle: string
}

export interface DashboardOverview {
  todaysBookingsCount: number
  upcomingTrips: Registration[]
  revenue: {
    total: number
    fromRegistrations: number
    fromLegacyBookings: number
    trend: RevenuePoint[]
  }
  pendingPayments: number
  pendingApprovals: number
  recentRegistrations: Registration[]
  recentCustomers: RecentCustomer[]
  seatAvailability: PackageSeatRow[]
  packageStats: {
    total: number
    archived: number
    byCategory: Partial<Record<PackageCategory, number>>
    byStatus: Partial<Record<PackageStatus, number>>
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// "Revenue (Manual)" — there's no payment gateway in this app (Phase 5's
// whole premise is manual QR verification), so revenue is simply the sum
// of amounts an admin has actually verified: Registration.paymentAmount
// for paymentStatus 'verified', plus the legacy Tour/Booking flow's
// amountPaid for paymentStatus 'confirmed'. Both flows stay independent
// modules; this is just where their numbers get added together for a
// single "how much have we actually collected" figure.
export async function getDashboardOverview(trendDays = 14): Promise<DashboardOverview> {
  const [registrations, packages, legacyBookings] = await Promise.all([
    listRegistrations(),
    listPackages({ includeArchived: true }),
    listBookings(),
  ])

  const now = new Date()
  const todaysBookingsCount = registrations.filter((r) => isSameDay(new Date(r.createdAt), now)).length

  const upcomingTrips = registrations
    .filter((r) => r.status === 'confirmed' && new Date(r.travelDate).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime())
    .slice(0, 8)

  const verifiedRegistrations = registrations.filter((r) => r.paymentStatus === 'verified')
  const fromRegistrations = verifiedRegistrations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0)
  const confirmedLegacy = legacyBookings.filter((b) => b.paymentStatus === 'confirmed')
  const fromLegacyBookings = confirmedLegacy.reduce((sum, b) => sum + (b.amountPaid || 0), 0)

  // Revenue trend: bucket verified amounts by the day they were reviewed
  // (paymentReviewedAt) so the chart reflects when money was actually
  // confirmed, not when the registration was first created.
  const trendMap = new Map<string, number>()
  for (let i = trendDays - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    trendMap.set(dayKey(d), 0)
  }
  for (const r of verifiedRegistrations) {
    if (!r.paymentReviewedAt) continue
    const key = dayKey(new Date(r.paymentReviewedAt))
    if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) || 0) + (r.paymentAmount || 0))
  }
  const trend: RevenuePoint[] = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }))

  const pendingPayments = registrations.filter(
    (r) => r.paymentStatus === 'not_submitted' || r.paymentStatus === 'resubmission_requested'
  ).length
  const pendingApprovals = registrations.filter((r) => r.paymentStatus === 'waiting_verification').length

  const recentRegistrations = registrations.slice(0, 8)

  // Recent (unique) customers by email, newest booking first.
  const byEmail = new Map<string, RecentCustomer>()
  for (const r of registrations) {
    const existing = byEmail.get(r.email)
    if (!existing) {
      byEmail.set(r.email, { name: r.name, email: r.email, mobile: r.mobile, lastBookingAt: r.createdAt, totalBookings: 1 })
    } else {
      existing.totalBookings += 1
      if (new Date(r.createdAt) > new Date(existing.lastBookingAt)) {
        existing.lastBookingAt = r.createdAt
        existing.name = r.name
        existing.mobile = r.mobile
      }
    }
  }
  const recentCustomers = Array.from(byEmail.values())
    .sort((a, b) => new Date(b.lastBookingAt).getTime() - new Date(a.lastBookingAt).getTime())
    .slice(0, 8)

  const seatAvailability: PackageSeatRow[] = await Promise.all(
    packages.map(async (p: Package) => ({ packageId: p._id, packageTitle: p.title, ...(await getSeatSummary(p._id)) }))
  )

  const byCategory: Partial<Record<PackageCategory, number>> = {}
  const byStatus: Partial<Record<PackageStatus, number>> = {}
  for (const p of packages) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1
    byStatus[p.status] = (byStatus[p.status] || 0) + 1
  }

  return {
    todaysBookingsCount,
    upcomingTrips,
    revenue: { total: fromRegistrations + fromLegacyBookings, fromRegistrations, fromLegacyBookings, trend },
    pendingPayments,
    pendingApprovals,
    recentRegistrations,
    recentCustomers,
    seatAvailability,
    packageStats: {
      total: packages.length,
      archived: packages.filter((p) => p.isArchived).length,
      byCategory,
      byStatus,
    },
  }
}

export interface CustomerSearchResult extends RecentCustomer {
  registrationIds: string[]
}

// Phase 8 — "Customer Search": groups matching registrations by email so
// one customer with several bookings shows up once, with a rollup of how
// many bookings they have. Reuses listRegistrations()'s `q` filter (see
// registration.service.ts) instead of re-implementing text matching here.
export async function searchCustomers(q: string): Promise<CustomerSearchResult[]> {
  const matches = await listRegistrations({ q })
  const byEmail = new Map<string, CustomerSearchResult>()
  for (const r of matches) {
    const existing = byEmail.get(r.email)
    if (!existing) {
      byEmail.set(r.email, {
        name: r.name,
        email: r.email,
        mobile: r.mobile,
        lastBookingAt: r.createdAt,
        totalBookings: 1,
        registrationIds: [r._id],
      })
    } else {
      existing.totalBookings += 1
      existing.registrationIds.push(r._id)
      if (new Date(r.createdAt) > new Date(existing.lastBookingAt)) {
        existing.lastBookingAt = r.createdAt
        existing.name = r.name
        existing.mobile = r.mobile
      }
    }
  }
  return Array.from(byEmail.values()).sort((a, b) => new Date(b.lastBookingAt).getTime() - new Date(a.lastBookingAt).getTime())
}
