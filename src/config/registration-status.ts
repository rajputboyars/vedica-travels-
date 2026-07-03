import type { Registration, RegistrationPaymentStatus } from '@/types'

// Shared badge metadata for Registration's three independent status
// dimensions (booking/payment/seat — see the type comments in
// types/registration.ts for why they're separate). Extracted here so the
// Customer Dashboard (Phase 9) and admin Registrations page (Phase 5/7)
// render identical labels/colors for the same status instead of drifting.
//
// Note: admin/registrations/page.tsx currently keeps its own copy (written
// before this module existed) — left as-is per the "don't rewrite working
// code" rule, but it's a natural candidate to migrate onto this shared
// config next time that page is touched.
export const bookingStatusMeta: Record<Registration['status'], { label: string; badgeClass: string }> = {
  pending_payment: { label: 'Pending Payment', badgeClass: 'bg-gray-100 text-gray-600' },
  confirmed: { label: 'Confirmed', badgeClass: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-red-100 text-red-700' },
}

export const paymentStatusMeta: Record<RegistrationPaymentStatus, { label: string; badgeClass: string }> = {
  not_submitted: { label: 'Not Submitted', badgeClass: 'bg-gray-100 text-gray-600' },
  waiting_verification: { label: 'Waiting for Verification', badgeClass: 'bg-amber-100 text-amber-700' },
  verified: { label: 'Verified', badgeClass: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', badgeClass: 'bg-red-100 text-red-700' },
  resubmission_requested: { label: 'Resubmission Requested', badgeClass: 'bg-blue-100 text-blue-700' },
}

export const seatStatusMeta: Record<Registration['seatStatus'], { label: string; badgeClass: string }> = {
  reserved: { label: 'Reserved (Temporary)', badgeClass: 'bg-sky-100 text-sky-700' },
  confirmed: { label: 'Seat Confirmed', badgeClass: 'bg-green-100 text-green-700' },
  released: { label: 'Seat Released', badgeClass: 'bg-gray-100 text-gray-500' },
  waiting_list: { label: 'Waiting List', badgeClass: 'bg-purple-100 text-purple-700' },
}

export function statusBadge(meta: { label: string; badgeClass: string }): { label: string; className: string } {
  return { label: meta.label, className: `text-xs px-2 py-0.5 rounded-full font-medium ${meta.badgeClass}` }
}
