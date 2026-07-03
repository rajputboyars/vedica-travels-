import type { ClientSession } from 'mongoose'
import { isDBConfigured, env } from '@/config/env'
import * as demo from '@/lib/demo/registrations'
import { getPackage } from './package.service'
import { serialize } from './serialize'
import { sendMail } from '@/lib/mailer'
import { siteConfig } from '@/config/site'
import { registrationReceivedEmail } from '@/emails/registration-received-email'
import { registrationAdminNotificationEmail } from '@/emails/registration-admin-notification-email'
import { waitlistedEmail } from '@/emails/waitlisted-email'
import { waitlistPromotedEmail } from '@/emails/waitlist-promoted-email'
import { paymentSubmittedEmail } from '@/emails/payment-submitted-email'
import { paymentSubmittedAdminNotificationEmail } from '@/emails/payment-submitted-admin-notification-email'
import { paymentVerifiedEmail } from '@/emails/payment-verified-email'
import { bookingConfirmedEmail } from '@/emails/booking-confirmed-email'
import { paymentRejectedEmail } from '@/emails/payment-rejected-email'
import { paymentResubmissionRequestedEmail } from '@/emails/payment-resubmission-requested-email'
import { tripReminderEmail } from '@/emails/trip-reminder-email'
import type { Registration, RegistrationInput, RegistrationStatus, RegistrationPaymentStatus, SeatStatus, PaymentSubmission } from '@/types'

// Every read/write to registration data goes through this module -- same
// "one door in" rule as tour/booking/package services. This is the Phase
// 4-8 booking + seat-management system for Package; the legacy Tour +
// Booking flow (booking.service.ts) is untouched and keeps working
// exactly as before.
async function db() {
  const [{ default: connectDB }, { default: Registration }] = await Promise.all([
    import('@/lib/db'),
    import('@/models/Registration'),
  ])
  await connectDB()
  return Registration
}

function adminRecipient(): string {
  return env.adminEmail || siteConfig.contact.email
}

// Notifications are best-effort: a mail hiccup should never fail a
// successful registration/payment action. Demo mode (no SMTP configured)
// logs to the console instead of throwing, via mailer.ts's own fallback --
// this try/catch is for real send failures (bad SMTP creds, network, etc).
async function safeSend(message: { to: string; subject: string; html: string }) {
  try {
    await sendMail(message)
  } catch (e) {
    console.error('[registration.service] notification email failed:', e)
  }
}

export interface RegistrationFilters {
  status?: RegistrationStatus
  paymentStatus?: RegistrationPaymentStatus
  packageId?: string
  // Phase 8 -- "Booking Search" / "Customer Search": free-text match
  // against name/email/mobile/bookingId. One filter shared by both admin
  // search surfaces instead of two near-identical query builders.
  q?: string
  // Phase 9 -- "My Trips"/"Booking History": matches on userId (bookings
  // made while logged in) OR email (guest bookings made with the same
  // email before/without an account) -- see the userId comment in
  // types/registration.ts. One filter shared by every customer-dashboard
  // surface instead of each page re-deriving "which bookings are mine".
  forUser?: { id: string; email: string }
}

function matchesFilters(r: Registration, filters: RegistrationFilters): boolean {
  if (filters.status && r.status !== filters.status) return false
  if (filters.paymentStatus && r.paymentStatus !== filters.paymentStatus) return false
  if (filters.packageId && r.packageId !== filters.packageId) return false
  if (filters.q) {
    const q = filters.q.toLowerCase()
    const haystack = `${r.name} ${r.email} ${r.mobile} ${r.bookingId}`.toLowerCase()
    if (!haystack.includes(q)) return false
  }
  if (filters.forUser) {
    const matchesUserId = r.userId === filters.forUser.id
    const matchesEmail = r.email.toLowerCase() === filters.forUser.email.toLowerCase()
    if (!matchesUserId && !matchesEmail) return false
  }
  return true
}

export async function listRegistrations(filters: RegistrationFilters = {}): Promise<Registration[]> {
  if (!isDBConfigured) return demo.getRegistrations().filter((r) => matchesFilters(r, filters))
  try {
    const Registration = await db()
    const query: Record<string, unknown> = {}
    if (filters.status) query.status = filters.status
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus
    if (filters.packageId) query.packageId = filters.packageId
    if (filters.q) {
      const re = new RegExp(filters.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: re }, { email: re }, { mobile: re }, { bookingId: re }]
    }
    if (filters.forUser) {
      const emailRe = new RegExp(`^${filters.forUser.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      query.$or = [{ userId: filters.forUser.id }, { email: emailRe }]
    }
    const registrations = await Registration.find(query).sort({ createdAt: -1 })
    return serialize(registrations)
  } catch {
    return demo.getRegistrations().filter((r) => matchesFilters(r, filters))
  }
}

export async function listRegistrationsByPackage(packageId: string): Promise<Registration[]> {
  return listRegistrations({ packageId })
}

// Phase 9 -- single implementation of "get this customer's bookings",
// consumed by every Customer Dashboard page (My Trips, Booking History,
// Upcoming Trips, etc.) instead of each one filtering listRegistrations()
// differently.
export async function listMyRegistrations(user: { _id: string; email: string }): Promise<Registration[]> {
  return listRegistrations({ forUser: { id: user._id, email: user.email } })
}

// Phase 9 — shared ownership check so both GET /api/registrations/[id]
// and PATCH /api/registrations/[id]/cancel apply the exact same "is this
// yours" rule (userId match, or same email for a guest booking made
// before this account existed) instead of each route re-deriving it.
export function isRegistrationOwner(registration: Registration, user: { _id: string; email: string }): boolean {
  return registration.userId === user._id || registration.email.toLowerCase() === user.email.toLowerCase()
}

export async function getRegistration(id: string): Promise<Registration | null> {
  if (!isDBConfigured) return demo.getRegistration(id) ?? null
  try {
    const Registration = await db()
    const r = await Registration.findById(id)
    return r ? serialize(r) : null
  } catch {
    return null
  }
}

export async function getRegistrationByBookingId(bookingId: string): Promise<Registration | null> {
  if (!isDBConfigured) return demo.getRegistrationByBookingId(bookingId) ?? null
  try {
    const Registration = await db()
    const r = await Registration.findOne({ bookingId })
    return r ? serialize(r) : null
  } catch {
    return null
  }
}

// Thrown for conditions the API route should map to a 4xx (not a 500) --
// see apiError()'s AuthError handling for the precedent; this is the same
// idea for a non-auth "bad request" case.
export class RegistrationError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export interface SeatSummary {
  totalSeats: number
  bookedSeats: number
  availableSeats: number
  waitingListCount: number
  waitingListPersons: number
}

// Phase 7 -- the full seat picture for a package: booked (confirmed),
// available, and waiting list. Only 'confirmed' registrations count
// against the total -- 'reserved' (temporary, unpaid) holds intentionally
// do not, so a package doesn't look sold out just from unpaid pending
// registrations (see the SeatStatus comment in types/registration.ts).
// This is the single source of truth for seat math; getSeatAvailability()
// below is a backward-compatible view over the same computation so
// existing callers (the public package page, Phase 5/6 API routes) don't
// need to change.
export async function getSeatSummary(packageId: string): Promise<SeatSummary> {
  const pkg = await getPackage(packageId)
  const totalSeats = pkg?.totalSeats ?? 0
  const registrations = await listRegistrationsByPackage(packageId)
  const bookedSeats = registrations
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + (r.numPersons || 0), 0)
  const waitlisted = registrations.filter((r) => r.seatStatus === 'waiting_list' && r.status !== 'cancelled')
  const waitingListPersons = waitlisted.reduce((sum, r) => sum + (r.numPersons || 0), 0)
  return {
    totalSeats,
    bookedSeats,
    availableSeats: Math.max(0, totalSeats - bookedSeats),
    waitingListCount: waitlisted.length,
    waitingListPersons,
  }
}

export interface SeatAvailability {
  totalSeats: number
  confirmedPersons: number
  available: number
}

export async function getSeatAvailability(packageId: string): Promise<SeatAvailability> {
  const summary = await getSeatSummary(packageId)
  return { totalSeats: summary.totalSeats, confirmedPersons: summary.bookedSeats, available: summary.availableSeats }
}

// The Phase 4 "Customer Flow" entry point, extended in Phase 7 with an
// atomic seat check: validates the package is bookable, decides
// reserved-vs-waiting-list under a database transaction where possible,
// persists the registration, and fires the right notification emails.
//
// Group bookings (numPersons > 1 on a single registration) work through
// this same math with no changes -- the seat check compares
// availableSeats against data.numPersons, not against "1 registration = 1
// seat" -- so a future dedicated "group booking" flow can keep calling
// this function unmodified.
export async function createRegistration(data: RegistrationInput, userId?: string): Promise<Registration> {
  const pkg = await getPackage(data.packageId)
  if (!pkg) throw new RegistrationError('Package not found', 404)
  if (pkg.status !== 'published' || pkg.isArchived) {
    throw new RegistrationError('This package is not currently open for registration', 409)
  }

  const bookingId = demo.genBookingId()
  const basePayload = {
    ...data,
    bookingId,
    packageTitle: pkg.title,
    status: 'pending_payment' as const,
    paymentStatus: 'not_submitted' as const,
    // Phase 9 -- additive/optional: registering never requires an account
    // (Phase 4's "no login required" is unchanged), but if the customer
    // happens to be logged in we tag the booking so it shows up in their
    // dashboard without them re-matching by email.
    ...(userId ? { userId } : {}),
  }

  let registration: Registration
  if (!isDBConfigured) {
    // Demo mode is a single in-memory process with no real concurrent
    // requests to race against, so a plain check-then-insert (no
    // transaction primitive exists here) is safe in practice.
    const summary = await getSeatSummary(data.packageId)
    const seatStatus: SeatStatus = summary.availableSeats >= data.numPersons ? 'reserved' : 'waiting_list'
    registration = demo.addRegistration({ ...basePayload, seatStatus })
  } else {
    registration = await createRegistrationInDB(basePayload, pkg.totalSeats, data.numPersons)
  }

  if (registration.seatStatus === 'waiting_list') {
    await Promise.all([
      safeSend({ to: registration.email, ...waitlistedEmail(registration) }),
      safeSend({ to: adminRecipient(), ...registrationAdminNotificationEmail(registration) }),
    ])
  } else {
    await Promise.all([
      safeSend({ to: registration.email, ...registrationReceivedEmail(registration, pkg) }),
      safeSend({ to: adminRecipient(), ...registrationAdminNotificationEmail(registration) }),
    ])
  }

  return registration
}

// Phase 7 -- the DB-mode seat check + insert, wrapped in a Mongo session
// transaction so "count confirmed seats" and "insert this registration"
// happen atomically: without this, two people registering for the last
// seat at the same instant could both read "1 seat available" and both
// get 'reserved'. Transactions require the MongoDB deployment to be a
// replica set (every MongoDB Atlas cluster -- including the free M0 tier
// -- is one; a bare local `mongod` is not), so this falls back to a
// best-effort sequential check if the transaction API itself is
// unavailable, rather than hard-failing registration on simpler setups.
async function createRegistrationInDB(
  basePayload: Record<string, unknown>,
  totalSeats: number,
  numPersons: number
): Promise<Registration> {
  const Registration = await db()
  const mongoose = (await import('mongoose')).default

  async function checkAndInsert(session?: ClientSession): Promise<Registration> {
    const confirmed = await Registration.find({ packageId: basePayload.packageId, status: 'confirmed' }).session(session ?? null)
    const bookedSeats = confirmed.reduce((sum, r) => sum + (r.numPersons || 0), 0)
    const available = Math.max(0, totalSeats - bookedSeats)
    const seatStatus: SeatStatus = available >= numPersons ? 'reserved' : 'waiting_list'
    const [doc] = await Registration.create([{ ...basePayload, seatStatus }], { session })
    return serialize<Registration>(doc)
  }

  const session = await mongoose.startSession()
  try {
    let result: Registration | undefined
    try {
      await session.withTransaction(async () => {
        result = await checkAndInsert(session)
      })
    } catch (e) {
      console.warn('[registration.service] transaction unavailable, falling back to non-transactional seat check:', e instanceof Error ? e.message : e)
      result = await checkAndInsert()
    }
    return result!
  } finally {
    await session.endSession()
  }
}

// Phase 7 -- admin cancels a booking: releases its seat hold and, if the
// package has a waiting list, atomically promotes the oldest entry into
// a fresh temporary reservation (same transaction-with-fallback pattern
// as createRegistrationInDB above).
export async function cancelRegistration(id: string, reason?: string): Promise<Registration | null> {
  const update = {
    status: 'cancelled' as const,
    seatStatus: 'released' as const,
    cancellationReason: reason,
  }

  if (!isDBConfigured) {
    const cancelled = demo.updateRegistration(id, update) ?? null
    if (cancelled) await promoteOldestWaitlisted(cancelled.packageId)
    return cancelled
  }

  const Registration = await db()
  const mongoose = (await import('mongoose')).default
  const session = await mongoose.startSession()
  try {
    let result: Registration | null = null
    async function cancelAndPromote(s?: ClientSession) {
      const doc = await Registration.findByIdAndUpdate(id, update, { new: true, session: s ?? null })
      if (!doc) return
      result = serialize<Registration>(doc)
      await promoteOldestWaitlisted(doc.packageId.toString(), s)
    }
    try {
      await session.withTransaction(() => cancelAndPromote(session))
    } catch (e) {
      console.warn('[registration.service] transaction unavailable, falling back to non-transactional cancel:', e instanceof Error ? e.message : e)
      await cancelAndPromote()
    }
    return result
  } finally {
    await session.endSession()
  }
}

// Finds the longest-waiting 'waiting_list' registration for a package and
// promotes it to a temporary 'reserved' hold, emailing the customer that
// a seat opened up. No-op if nobody is waiting.
async function promoteOldestWaitlisted(packageId: string, session?: ClientSession): Promise<void> {
  let promoted: Registration | null = null

  if (!isDBConfigured) {
    const waiting = demo
      .getRegistrationsByPackage(packageId)
      .filter((r) => r.seatStatus === 'waiting_list' && r.status !== 'cancelled')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const next = waiting[0]
    if (next) promoted = demo.updateRegistration(next._id, { seatStatus: 'reserved' }) ?? null
  } else {
    const Registration = await db()
    const next = await Registration.findOne({ packageId, seatStatus: 'waiting_list', status: { $ne: 'cancelled' } })
      .sort({ createdAt: 1 })
      .session(session ?? null)
    if (next) {
      next.seatStatus = 'reserved'
      await next.save({ session })
      promoted = serialize<Registration>(next)
    }
  }

  if (promoted) {
    const pkg = await getPackage(packageId)
    await safeSend({ to: promoted.email, ...waitlistPromotedEmail(promoted, pkg) })
  }
}

// Phase 5 -- customer uploads screenshot/transaction details.
// paymentSubmittedAt is set here (server clock), not accepted from the
// client payload -- an attacker-controlled "submission time" would let
// someone claim they paid before they actually did.
//
// Phase 6: fires "Payment Submitted" to the customer and an admin
// notification so nobody has to poll the dashboard to know a review is
// waiting.
export async function submitPayment(id: string, data: PaymentSubmission): Promise<Registration | null> {
  const update = {
    paymentScreenshot: data.paymentScreenshot,
    transactionId: data.transactionId,
    upiId: data.upiId,
    paymentAmount: data.paymentAmount,
    paymentSubmittedAt: new Date().toISOString(),
    paymentStatus: 'waiting_verification' as const,
  }
  const registration = !isDBConfigured
    ? demo.updateRegistration(id, update) ?? null
    : serialize<Registration | null>(await (await db()).findByIdAndUpdate(id, update, { new: true }))

  if (registration) {
    await Promise.all([
      safeSend({ to: registration.email, ...paymentSubmittedEmail(registration) }),
      safeSend({ to: adminRecipient(), ...paymentSubmittedAdminNotificationEmail(registration) }),
    ])
  }
  return registration
}

// Phase 5 -- Approve Flow: Payment Status -> Verified, Booking Status ->
// Confirmed. seatStatus becomes 'confirmed', which is what makes
// getSeatSummary()/getSeatAvailability() above actually count it -- this
// is the "Seat Count decreases automatically" behavior (Phase 5/7),
// computed rather than a separately-maintained counter (see
// types/registration.ts SeatStatus).
//
// Phase 6: sends both "Payment Approved" and "Booking Confirmed" --
// distinct templates for a payment event vs. a trip event, see the
// comment in booking-confirmed-email.ts for why they're kept separate.
export async function approvePayment(id: string): Promise<Registration | null> {
  const update = {
    paymentStatus: 'verified' as const,
    status: 'confirmed' as const,
    seatStatus: 'confirmed' as const,
    paymentReviewedAt: new Date().toISOString(),
  }
  const registration = !isDBConfigured
    ? demo.updateRegistration(id, update) ?? null
    : serialize<Registration | null>(await (await db()).findByIdAndUpdate(id, update, { new: true }))

  if (registration) {
    const pkg = await getPackage(registration.packageId)
    await Promise.all([
      safeSend({ to: registration.email, ...paymentVerifiedEmail(registration) }),
      safeSend({ to: registration.email, ...bookingConfirmedEmail(registration, pkg) }),
    ])
  }
  return registration
}

// Phase 5 -- Rejected Flow: Payment Status -> Rejected, reason emailed to
// the customer. Deliberately does NOT touch status/seatStatus -- the
// booking stays pending_payment/reserved so the customer can resubmit a
// corrected payment without losing their temporary seat hold.
export async function rejectPayment(id: string, reason: string): Promise<Registration | null> {
  const update = {
    paymentStatus: 'rejected' as const,
    paymentReviewNote: reason,
    paymentReviewedAt: new Date().toISOString(),
  }
  const registration = !isDBConfigured
    ? demo.updateRegistration(id, update) ?? null
    : serialize<Registration | null>(await (await db()).findByIdAndUpdate(id, update, { new: true }))

  if (registration) await safeSend({ to: registration.email, ...paymentRejectedEmail(registration, reason) })
  return registration
}

// Phase 5 -- "Request New Screenshot": not a rejection, just needs better
// proof (illegible screenshot, mismatched amount, etc).
export async function requestResubmission(id: string, reason: string): Promise<Registration | null> {
  const update = {
    paymentStatus: 'resubmission_requested' as const,
    paymentReviewNote: reason,
    paymentReviewedAt: new Date().toISOString(),
  }
  const registration = !isDBConfigured
    ? demo.updateRegistration(id, update) ?? null
    : serialize<Registration | null>(await (await db()).findByIdAndUpdate(id, update, { new: true }))

  if (registration) await safeSend({ to: registration.email, ...paymentResubmissionRequestedEmail(registration, reason) })
  return registration
}

// Phase 6 -- "Trip Reminder": no in-app scheduler exists (Next.js/Vercel
// serverless has none), so this is designed to be called once a day by
// an external trigger -- see POST /api/registrations/send-reminders. Only
// confirmed registrations get reminders (an unpaid/pending registration
// has nothing confirmed to remind them about), and reminderSentAt makes
// repeated daily calls idempotent instead of re-emailing every run.
export async function sendTripReminders(daysBefore = 3): Promise<{ sent: number }> {
  const all = await listRegistrations({ status: 'confirmed' })
  const now = Date.now()
  const windowMs = daysBefore * 86400000
  const due = all.filter((r) => {
    if (r.reminderSentAt) return false
    const travelTime = new Date(r.travelDate).getTime()
    const diff = travelTime - now
    return diff > 0 && diff <= windowMs
  })

  let sent = 0
  for (const registration of due) {
    const pkg = await getPackage(registration.packageId)
    const daysLeft = Math.max(1, Math.ceil((new Date(registration.travelDate).getTime() - now) / 86400000))
    await safeSend({ to: registration.email, ...tripReminderEmail(registration, pkg, daysLeft) })
    const update = { reminderSentAt: new Date().toISOString() }
    if (!isDBConfigured) demo.updateRegistration(registration._id, update)
    else await (await db()).findByIdAndUpdate(registration._id, update)
    sent++
  }
  return { sent }
}
