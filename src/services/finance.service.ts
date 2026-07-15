// Travel Finance module — pure computation on top of existing Tour +
// Booking data plus the new TripExpense / Vendor collections. This service
// owns NO storage of its own; every number is derived, so nothing can drift
// out of sync with bookings (revenue) or expenses (costs).
import type {
  Booking,
  ComputedExpense,
  TripExpense,
  TripFinanceSummary,
  Tour,
  VendorWithTotals,
  CategoryTotal,
  ExpenseCategory,
} from '@/types'
import { getTour, listTours } from './tour.service'
import { listBookingsByTour, listBookings } from './booking.service'
import { listExpensesByTour, listAllExpenses } from './expense.service'
import { listVendors } from './vendor.service'

// Passengers actually confirmed via bookings — the count that drives revenue
// and per-passenger (variable) expenses.
export function confirmedPassengersOf(bookings: Booking[]): number {
  return bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.numPersons || b.passengers?.length || 0), 0)
}

// Fixed expense total = rate × quantity. Variable = rate × confirmed
// passengers (recalculated live, never stored).
export function computeExpenseTotal(e: TripExpense, confirmedPassengers: number): number {
  return e.type === 'variable' ? e.rate * confirmedPassengers : e.rate * (e.quantity || 1)
}

function computeExpense(e: TripExpense, confirmedPassengers: number, vendorName?: string): ComputedExpense {
  const totalAmount = computeExpenseTotal(e, confirmedPassengers)
  return { ...e, totalAmount, pendingAmount: Math.max(0, totalAmount - (e.amountPaid || 0)), vendorName }
}

function round(n: number): number {
  return Math.round(n)
}

// Core per-trip summary. Everything the finance dashboard, break-even card,
// and command center need, computed from one tour + its bookings + expenses.
export function buildSummary(tour: Tour, bookings: Booking[], expenses: TripExpense[]): TripFinanceSummary {
  const price = tour.price || 0
  const totalSeats = tour.totalSeats || 0
  const availableSeats = tour.availableSeats ?? totalSeats
  const bookedSeats = Math.max(0, totalSeats - availableSeats)
  const occupancyPct = totalSeats > 0 ? round((bookedSeats / totalSeats) * 100) : 0

  const confirmedPassengers = confirmedPassengersOf(bookings)
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')

  // Revenue from confirmed passengers; collection from what they've paid.
  const totalRevenue = confirmedPassengers * price
  const expectedRevenue = totalSeats * price
  const collectedAmount = confirmedBookings.reduce((s, b) => s + (b.amountPaid || 0), 0)
  const pendingCollection = Math.max(0, totalRevenue - collectedAmount)

  // Expenses.
  let totalFixedExpenses = 0
  let totalVariableExpenses = 0
  let variableCostPerPassenger = 0
  const categoryMap = new Map<ExpenseCategory, number>()
  let pendingVendorPayments = 0
  let paidVendorPayments = 0

  for (const e of expenses) {
    const total = computeExpenseTotal(e, confirmedPassengers)
    if (e.type === 'variable') {
      totalVariableExpenses += total
      variableCostPerPassenger += e.rate
    } else {
      totalFixedExpenses += total
    }
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + total)
    paidVendorPayments += e.amountPaid || 0
    pendingVendorPayments += Math.max(0, total - (e.amountPaid || 0))
  }

  const totalExpenses = totalFixedExpenses + totalVariableExpenses
  const costPerPassenger = confirmedPassengers > 0 ? round(totalExpenses / confirmedPassengers) : 0

  const currentProfit = Math.max(0, totalRevenue - totalExpenses)
  const currentLoss = Math.max(0, totalExpenses - totalRevenue)

  // Expected profit assumes a full bus: fixed costs unchanged, variable
  // scales to every seat.
  const projectedExpenses = totalFixedExpenses + variableCostPerPassenger * totalSeats
  const expectedProfit = expectedRevenue - projectedExpenses

  // Break-even passengers = fixed / (price − variable-per-passenger).
  const margin = price - variableCostPerPassenger
  const breakEvenPassengers = margin > 0 ? Math.ceil(totalFixedExpenses / margin) : null
  const breakEvenReached = breakEvenPassengers !== null && confirmedPassengers >= breakEvenPassengers

  const categoryBreakdown: CategoryTotal[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return {
    tourId: tour._id,
    price,
    totalSeats,
    availableSeats,
    bookedSeats,
    occupancyPct,
    confirmedPassengers,
    totalRevenue,
    expectedRevenue,
    collectedAmount,
    pendingCollection,
    totalFixedExpenses,
    totalVariableExpenses,
    totalExpenses,
    variableCostPerPassenger,
    costPerPassenger,
    categoryBreakdown,
    currentProfit,
    currentLoss,
    expectedProfit,
    breakEvenPassengers,
    breakEvenReached,
    pendingVendorPayments,
    paidVendorPayments,
  }
}

// Full payload for the Trip Finance dashboard: tour, computed summary, and
// the expense rows with their live totals + vendor names resolved.
export async function getTripFinance(
  tourId: string,
): Promise<{ tour: Tour; summary: TripFinanceSummary; expenses: ComputedExpense[] } | null> {
  const tour = await getTour(tourId)
  if (!tour) return null

  const [bookings, expenses, vendors] = await Promise.all([
    listBookingsByTour(tourId),
    listExpensesByTour(tourId),
    listVendors(),
  ])

  const vendorNameById = new Map(vendors.map((v) => [v._id, v.name]))
  const confirmedPassengers = confirmedPassengersOf(bookings)
  const computed = expenses.map((e) => computeExpense(e, confirmedPassengers, e.vendorId ? vendorNameById.get(e.vendorId) : undefined))
  const summary = buildSummary(tour, bookings, expenses)

  return { tour, summary, expenses: computed }
}

// Vendors with billed / paid / pending totals derived from every linked
// expense across all trips (variable expenses resolved per-trip passenger
// count). Used by the Vendor Management page.
export async function listVendorsWithTotals(): Promise<VendorWithTotals[]> {
  const [vendors, expenses, tours, bookings] = await Promise.all([
    listVendors(),
    listAllExpenses(),
    listTours(),
    listBookings(),
  ])

  // tourId -> confirmed passengers, so variable expense totals are accurate.
  const paxByTour = new Map<string, number>()
  for (const tour of tours) {
    const tourBookings = bookings.filter((b) => {
      const bid = typeof b.tourId === 'string' ? b.tourId : (b.tourId as unknown as { _id?: string })?._id
      return bid === tour._id
    })
    paxByTour.set(tour._id, confirmedPassengersOf(tourBookings))
  }

  return vendors.map((v) => {
    const linked = expenses.filter((e) => e.vendorId === v._id)
    let totalBilled = 0
    let paidAmount = 0
    for (const e of linked) {
      totalBilled += computeExpenseTotal(e, paxByTour.get(e.tourId) || 0)
      paidAmount += e.amountPaid || 0
    }
    return {
      ...v,
      expenseCount: linked.length,
      totalBilled,
      paidAmount,
      pendingAmount: Math.max(0, totalBilled - paidAmount),
    }
  })
}
