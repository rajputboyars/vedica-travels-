// Phase 6 — "Payment Submitted": sent to the customer the moment they
// upload a screenshot/transaction ID (registration.service.ts
// submitPayment()), so they get immediate confirmation their submission
// was received while it's queued for admin review.
import type { Registration } from '@/types'
import { emailShell, heading, infoTable, badge } from './components/layout'

export function paymentSubmittedEmail(registration: Registration): { subject: string; html: string } {
  const subject = `Payment details received — ${registration.bookingId}`
  const body = `
    ${heading('Payment Details Received')}
    <p>Hi ${registration.name},</p>
    <p>We've received your payment details for <strong>${registration.packageTitle}</strong>.</p>
    <p style="margin:12px 0;">${badge('Waiting for Verification', 'warning')}</p>
    ${infoTable([
      ['Booking ID', registration.bookingId],
      ['Transaction ID', registration.transactionId || '—'],
      ['Amount submitted', registration.paymentAmount != null ? `₹${registration.paymentAmount.toLocaleString()}` : '—'],
    ])}
    <p>Our team will verify this shortly and email you once it's confirmed.</p>
  `
  return { subject, html: emailShell(body, { preheader: 'Your payment is being verified' }) }
}
