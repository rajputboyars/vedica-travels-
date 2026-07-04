// Registration = the "first booking version" for Package (Phase 4), which
// then grows a payment-verification workflow in place (Phase 5) rather
// than becoming a second model — the spec's own language ("Customer opens
// booking") treats a Registration as *the* booking once it exists, so
// Phase 5's screenshot/transaction/approve/reject fields are additive
// fields on this same entity, not a new collection.
//
// This is deliberately independent of the legacy Tour + Booking system
// (models/Booking.ts) — that flow keeps working exactly as it did; this
// is the equivalent flow for Package.
import type { Gender, IdType } from './booking'

// Booking-level lifecycle. Stays 'pending_payment' through screenshot
// submission/verification-waiting; only becomes 'confirmed' once an admin
// approves the payment (see registration.service.ts approvePayment()).
export type RegistrationStatus = 'pending_payment' | 'confirmed' | 'cancelled'

// Payment-level lifecycle (Phase 5). Kept separate from RegistrationStatus
// on purpose — same reasoning as Booking.status vs Booking.paymentStatus —
// so "has this been paid/verified" and "is this booking confirmed" can be
// reasoned about independently.
export type RegistrationPaymentStatus =
  | 'not_submitted'
  | 'waiting_verification'
  | 'verified'
  | 'rejected'
  | 'resubmission_requested'

// "Reserved (Temporary)" per the Phase 4 spec: a fresh registration holds
// a temporary spot that does NOT count against the package's public seat
// availability (see getSeatAvailability() in registration.service.ts).
// It only becomes 'confirmed' — and only then actually decrements the
// seats shown to other customers — once an admin approves the payment
// (Phase 5's "Seat Count decreases automatically"). 'released' frees the
// temporary hold (e.g. admin cancels a stale unpaid registration).
// 'waiting_list' (Phase 7): assigned instead of 'reserved' when the
// package has no seats left at registration time — see
// createRegistration()'s atomic seat check in registration.service.ts.
export type SeatStatus = 'reserved' | 'confirmed' | 'released' | 'waiting_list'

export interface Registration {
  _id: string
  bookingId: string
  packageId: string
  // Denormalized snapshot (same pattern as Booking.tourTitle) so admin
  // lists/emails don't need a join just to show what was booked.
  packageTitle: string

  // Phase 4 — required registration fields
  name: string
  age: number
  gender: Gender
  mobile: string
  email: string
  address: string
  city: string
  state: string
  // Split into name+phone (like the legacy Booking model's
  // emergencyContact/emergencyPhone) instead of one free-text field —
  // a contact you can't call isn't useful in an emergency.
  emergencyContactName: string
  emergencyContactPhone: string
  idType: IdType
  idNumber: string
  travelDate: string
  numPersons: number
  specialRequests?: string

  status: RegistrationStatus
  seatStatus: SeatStatus

  // Phase 5 — QR payment verification (all optional/absent until the
  // customer submits payment via PUT /api/registrations/[id]/payment)
  paymentStatus: RegistrationPaymentStatus
  paymentScreenshot?: string
  transactionId?: string
  upiId?: string
  paymentAmount?: number
  // Set server-side at receipt time, not trusted from the client — see
  // the comment in registration.service.ts submitPayment().
  paymentSubmittedAt?: string
  // Reason shown to the customer — used for both "Reject Payment" and
  // "Request New Screenshot", since both are "here's why, please fix it"
  // messages that differ only in whether the payment is being refused
  // outright or just needs better proof.
  paymentReviewNote?: string
  paymentReviewedAt?: string

  // Phase 6 — set once sendTripReminders() emails this registration, so
  // a daily cron run never sends the same reminder twice.
  reminderSentAt?: string

  // Phase 7 — set when an admin cancels this booking (distinct from
  // paymentReviewNote, which is customer-facing payment feedback).
  cancellationReason?: string

  // Phase 9 — set when the customer was logged in at registration time
  // (optional/nullable: registering never requires an account). "My
  // Bookings" matches on this OR on email for pre-account guest bookings
  // — see listRegistrations()'s `mine` filter.
  userId?: string

  createdAt: string
  updatedAt: string
}

// Client-facing create payload — exactly the Phase 4 registration form
// fields. Everything system-generated (bookingId, packageTitle, status,
// seatStatus, all Phase 5/6/7/9 payment/reminder/cancellation/user fields)
// is deliberately excluded so the API can't be used to smuggle a
// pre-verified registration.
export type RegistrationInput = Omit<
  Registration,
  | '_id'
  | 'bookingId'
  | 'packageTitle'
  | 'status'
  | 'seatStatus'
  | 'paymentStatus'
  | 'paymentScreenshot'
  | 'transactionId'
  | 'upiId'
  | 'paymentAmount'
  | 'paymentSubmittedAt'
  | 'paymentReviewNote'
  | 'paymentReviewedAt'
  | 'reminderSentAt'
  | 'cancellationReason'
  | 'userId'
  | 'createdAt'
  | 'updatedAt'
>

// Payload for PUT /api/registrations/[id]/payment (Phase 5 "customer
// uploads screenshot" step).
export interface PaymentSubmission {
  paymentScreenshot: string
  transactionId: string
  upiId?: string
  paymentAmount: number
}
