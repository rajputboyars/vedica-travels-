// Travel Finance & Operations module (additive — extends the existing Tour
// business with per-trip expense tracking, vendor management, and a computed
// financial summary). Nothing here changes Booking/Registration/payment
// types; revenue is derived from the existing confirmed Booking data.

// ---- Expenses -----------------------------------------------------------
// A fixed expense is a flat cost for the whole trip (Bus Rent, Hotel, Guide):
// total = rate × quantity. A variable expense is per-passenger (Breakfast,
// Lunch, Dinner): total = rate × <current confirmed passengers>, so it
// recalculates automatically as bookings change — the rate/quantity stored
// on the doc never has to be touched.
export type ExpenseType = 'fixed' | 'variable'

export type ExpensePaymentStatus = 'pending' | 'partial' | 'paid'

export type ExpenseCategory =
  | 'transport'
  | 'fuel'
  | 'salary'
  | 'accommodation'
  | 'food'
  | 'refreshments'
  | 'guide'
  | 'darshan'
  | 'photography'
  | 'miscellaneous'

export interface TripExpense {
  _id: string
  tourId: string
  name: string
  category: ExpenseCategory
  description?: string
  type: ExpenseType
  // Fixed: number of units (e.g. 2 buses). Variable: ignored — the live
  // confirmed-passenger count is used instead.
  quantity: number
  // Per-unit cost (fixed) or per-passenger cost (variable).
  rate: number
  vendorId?: string
  paymentStatus: ExpensePaymentStatus
  amountPaid: number
  expenseDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type TripExpenseInput = Omit<TripExpense, '_id' | 'createdAt' | 'updatedAt'>

// A TripExpense with its computed money fields resolved for a given
// passenger count. `totalAmount` is never persisted (variable expenses
// depend on live bookings); it is computed on read.
export interface ComputedExpense extends TripExpense {
  totalAmount: number
  pendingAmount: number
  vendorName?: string
}

// ---- Vendors ------------------------------------------------------------
export type VendorType = 'bus' | 'hotel' | 'restaurant' | 'guide' | 'fuel' | 'photographer' | 'other'

export interface Vendor {
  _id: string
  name: string
  type: VendorType
  phone?: string
  email?: string
  address?: string
  bankDetails?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type VendorInput = Omit<Vendor, '_id' | 'createdAt' | 'updatedAt'>

// A Vendor with its outstanding/paid totals derived from linked expenses
// (never stored on the vendor — avoids duplication / drift).
export interface VendorWithTotals extends Vendor {
  expenseCount: number
  totalBilled: number
  paidAmount: number
  pendingAmount: number
}

// ---- Computed trip finance summary -------------------------------------
export interface CategoryTotal {
  category: ExpenseCategory
  amount: number
}

export interface TripFinanceSummary {
  tourId: string
  price: number

  // Seats / occupancy (uses the Tour's own seat counter for occupancy).
  totalSeats: number
  availableSeats: number
  bookedSeats: number
  occupancyPct: number

  // Passengers actually confirmed via bookings — drives revenue + variable cost.
  confirmedPassengers: number

  // Revenue & collection.
  totalRevenue: number
  expectedRevenue: number
  collectedAmount: number
  pendingCollection: number

  // Expenses.
  totalFixedExpenses: number
  totalVariableExpenses: number
  totalExpenses: number
  variableCostPerPassenger: number
  costPerPassenger: number
  categoryBreakdown: CategoryTotal[]

  // Profit / loss (current = based on confirmed revenue).
  currentProfit: number
  currentLoss: number
  expectedProfit: number

  // Break-even: fixed / (price − variableCostPerPassenger). null when the
  // per-passenger margin is ≤ 0 (trip can never recover fixed costs at this price).
  breakEvenPassengers: number | null
  breakEvenReached: boolean

  // Vendor payables across this trip's expenses.
  pendingVendorPayments: number
  paidVendorPayments: number
}

// Display metadata shared by admin UI (labels + which categories default to
// fixed vs variable when the admin picks a category).
export const expenseCategoryMeta: Record<ExpenseCategory, { label: string; defaultType: ExpenseType }> = {
  transport: { label: 'Transport', defaultType: 'fixed' },
  fuel: { label: 'Fuel / Diesel', defaultType: 'fixed' },
  salary: { label: 'Salary (Driver/Helper)', defaultType: 'fixed' },
  accommodation: { label: 'Accommodation / Hotel', defaultType: 'fixed' },
  food: { label: 'Food (Breakfast/Lunch/Dinner)', defaultType: 'variable' },
  refreshments: { label: 'Refreshments (Water/Snacks)', defaultType: 'variable' },
  guide: { label: 'Guide Charges', defaultType: 'fixed' },
  darshan: { label: 'VIP Darshan', defaultType: 'variable' },
  photography: { label: 'Photography', defaultType: 'fixed' },
  miscellaneous: { label: 'Miscellaneous', defaultType: 'fixed' },
}

export const vendorTypeMeta: Record<VendorType, { label: string }> = {
  bus: { label: 'Bus Owner' },
  hotel: { label: 'Hotel' },
  restaurant: { label: 'Restaurant' },
  guide: { label: 'Guide' },
  fuel: { label: 'Fuel Station' },
  photographer: { label: 'Photographer' },
  other: { label: 'Other' },
}
