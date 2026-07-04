// Phase 12 (architecture-only) — extension point, not an implementation.
//
// "Coupons", "Referral System", and "Loyalty Points" (Phase 12 future
// modules list) are three separate future features that all reduce to
// the same question at checkout time: "does this booking qualify for a
// discount, and how much?" Modeling them behind one `DiscountEngine`
// contract now means registration.service.ts's createRegistration() (or
// its future booking.service.ts equivalent) only needs one integration
// point -- `getApplicableDiscount(...)` -- instead of three separate
// conditionals for coupon codes, referral credits, and loyalty-point
// redemption, each of which would otherwise need its own call site
// wired into the booking flow.
//
// No code currently implements or consumes this interface.

export type DiscountSource = 'coupon' | 'referral' | 'loyalty'

export interface DiscountQuery {
  userId?: string
  code?: string
  orderAmount: number
}

export interface DiscountResult {
  source: DiscountSource
  /** Absolute amount to subtract from orderAmount, in the same currency. */
  discountAmount: number
  description: string
}

export interface DiscountEngine {
  readonly source: DiscountSource
  getApplicableDiscount(query: DiscountQuery): Promise<DiscountResult | null>
}

export interface LoyaltyAccount {
  userId: string
  pointsBalance: number
  tier?: string
}

export interface LoyaltyProgram {
  getAccount(userId: string): Promise<LoyaltyAccount>
  awardPoints(userId: string, points: number, reason: string): Promise<LoyaltyAccount>
  redeemPoints(userId: string, points: number): Promise<LoyaltyAccount>
}
