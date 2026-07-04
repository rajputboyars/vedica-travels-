// Phase 12 (architecture-only) — extension point, not an implementation.
//
// Every booking flow today (registration.service.ts, booking.service.ts)
// uses the same "no online payment — pay by QR, admin verifies manually"
// pattern (see Package.paymentNote/qrImages and the admin payment
// verification dashboard). "Travel EMI Options"/online payments, "Travel
// Wallet", and "Coupons" (Phase 12 future modules list) all eventually
// need an actual payment gateway integration (Razorpay/Stripe/etc.) and a
// wallet balance to debit from.
//
// The contract below is what a real gateway integration would implement,
// so booking code could call `paymentGateway.charge(...)` instead of a
// specific SDK, and demo mode could keep working via a
// ManualQrPaymentGateway implementation that just records the existing
// "awaiting verification" state as it does today. Wallet debits are
// modeled as a distinct method since a wallet balance isn't a gateway
// charge, but the two need to compose (e.g. "pay partially from wallet,
// remainder via gateway") without either module knowing the other's
// internals.
//
// No code currently implements or consumes this interface.

export interface ChargeRequest {
  amount: number
  currency: string
  /** Free-form reference back to the booking/registration this charge is for. */
  referenceId: string
  description?: string
}

export interface ChargeResult {
  success: boolean
  transactionId: string
  status: 'pending' | 'succeeded' | 'failed'
  error?: string
}

export interface PaymentGateway {
  readonly provider: string
  charge(request: ChargeRequest): Promise<ChargeResult>
  refund(transactionId: string, amount?: number): Promise<ChargeResult>
}

export interface WalletLedgerEntry {
  userId: string
  amount: number
  type: 'credit' | 'debit'
  reason: string
  createdAt: string
}

export interface WalletProvider {
  getBalance(userId: string): Promise<number>
  credit(userId: string, amount: number, reason: string): Promise<WalletLedgerEntry>
  debit(userId: string, amount: number, reason: string): Promise<WalletLedgerEntry>
}
