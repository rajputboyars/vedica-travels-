// In-memory TripExpense store used when MONGODB_URI is not configured
// (same pattern as demo/bookings.ts). Seeded for demo-tour-1 so the trip
// finance dashboard shows a realistic mix of fixed + variable expenses.
import type { TripExpense } from '@/types'

type Store = { expenses: TripExpense[]; seeded: boolean }

const g = global as unknown as { __demoExpenseStore?: Store }

if (!g.__demoExpenseStore) {
  g.__demoExpenseStore = { expenses: [], seeded: false }
}

const store = g.__demoExpenseStore

function now() {
  return new Date().toISOString()
}

function seed() {
  if (store.seeded) return
  store.seeded = true
  const base = (over: Partial<TripExpense>): TripExpense => ({
    _id: 'demo-exp-' + Math.random().toString(36).slice(2, 8),
    tourId: 'demo-tour-1',
    name: '',
    category: 'miscellaneous',
    type: 'fixed',
    quantity: 1,
    rate: 0,
    paymentStatus: 'pending',
    amountPaid: 0,
    expenseDate: now(),
    createdAt: now(),
    updatedAt: now(),
    ...over,
  })
  store.expenses = [
    base({ name: 'AC Bus Rent', category: 'transport', type: 'fixed', quantity: 1, rate: 25000, vendorId: 'demo-vendor-1', paymentStatus: 'partial', amountPaid: 10000, notes: '2-day round trip' }),
    base({ name: 'Diesel', category: 'fuel', type: 'fixed', quantity: 1, rate: 12000, vendorId: 'demo-vendor-4', paymentStatus: 'paid', amountPaid: 12000 }),
    base({ name: 'Driver + Helper Salary', category: 'salary', type: 'fixed', quantity: 1, rate: 4000, paymentStatus: 'pending', amountPaid: 0 }),
    base({ name: 'Hotel (1 night)', category: 'accommodation', type: 'fixed', quantity: 1, rate: 8000, vendorId: 'demo-vendor-3', paymentStatus: 'pending', amountPaid: 0 }),
    base({ name: 'Guide Charges', category: 'guide', type: 'fixed', quantity: 1, rate: 3000, paymentStatus: 'pending', amountPaid: 0 }),
    base({ name: 'Breakfast', category: 'food', type: 'variable', rate: 80, vendorId: 'demo-vendor-2', paymentStatus: 'pending', amountPaid: 0 }),
    base({ name: 'Lunch', category: 'food', type: 'variable', rate: 180, vendorId: 'demo-vendor-2', paymentStatus: 'pending', amountPaid: 0 }),
    base({ name: 'Dinner', category: 'food', type: 'variable', rate: 200, vendorId: 'demo-vendor-2', paymentStatus: 'pending', amountPaid: 0 }),
    base({ name: 'Water & Snacks', category: 'refreshments', type: 'variable', rate: 40, paymentStatus: 'paid', amountPaid: 0 }),
  ]
}

export function getExpenses(): TripExpense[] {
  seed()
  return store.expenses
}

export function getExpensesByTour(tourId: string): TripExpense[] {
  return getExpenses().filter((e) => e.tourId === tourId)
}

export function getExpense(id: string): TripExpense | undefined {
  return getExpenses().find((e) => e._id === id)
}

export function addExpense(data: Partial<TripExpense>): TripExpense {
  seed()
  const expense: TripExpense = {
    _id: 'exp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    tourId: data.tourId || '',
    name: data.name || '',
    category: data.category || 'miscellaneous',
    description: data.description,
    type: data.type || 'fixed',
    quantity: data.quantity ?? 1,
    rate: data.rate ?? 0,
    vendorId: data.vendorId,
    paymentStatus: data.paymentStatus || 'pending',
    amountPaid: data.amountPaid ?? 0,
    expenseDate: data.expenseDate || now(),
    notes: data.notes,
    createdAt: now(),
    updatedAt: now(),
  }
  store.expenses.unshift(expense)
  return expense
}

export function updateExpense(id: string, data: Partial<TripExpense>): TripExpense | undefined {
  const e = getExpense(id)
  if (!e) return undefined
  Object.assign(e, data, { updatedAt: now() })
  return e
}

export function deleteExpense(id: string): boolean {
  seed()
  const idx = store.expenses.findIndex((e) => e._id === id)
  if (idx === -1) return false
  store.expenses.splice(idx, 1)
  return true
}
