// Phase 6 — admin-facing counterpart to payment-submitted-email.ts: lets
// the admin know a registration needs review without having to poll the
// dashboard. Mirrors registration-admin-notification-email.ts's shape.
import type { Registration } from '@/types'
import { emailShell, heading, infoTable } from './components/layout'

export function paymentSubmittedAdminNotificationEmail(registration: Registration): { subject: string; html: string } {
  const subject = `Payment awaiting verification — ${registration.packageTitle} (${registration.bookingId})`
  const body = `
    ${heading('Payment Needs Verification')}
    ${infoTable([
      ['Package', registration.packageTitle],
      ['Booking ID', registration.bookingId],
      ['Name', registration.name],
      ['Mobile', registration.mobile],
      ['Transaction ID', registration.transactionId || '—'],
      ['UPI ID', registration.upiId || '—'],
      ['Amount submitted', registration.paymentAmount != null ? `₹${registration.paymentAmount.toLocaleString()}` : '—'],
    ])}
    <p style="color:#888;font-size:13px;">Review the screenshot and Approve/Reject/Request a new one from the admin dashboard under Registrations.</p>
  `
  return { subject, html: emailShell(body, { preheader: `Payment needs verification — ${registration.bookingId}` }) }
}
