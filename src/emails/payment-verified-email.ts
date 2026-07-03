// Phase 5/6 — "Payment Approved": sent once an admin verifies the
// payment screenshot/transaction. See booking-confirmed-email.ts for the
// fuller "you're all set" email sent alongside this one.
import type { Registration } from '@/types'
import { emailShell, heading, infoTable, badge } from './components/layout'

export function paymentVerifiedEmail(registration: Registration): { subject: string; html: string } {
  const subject = `Payment verified — ${registration.bookingId}`
  const body = `
    ${heading('Payment Verified', '#16a34a')}
    <p>Hi ${registration.name},</p>
    <p>Your payment for <strong>${registration.packageTitle}</strong> has been verified.</p>
    <p style="margin:12px 0;">${badge('Payment Approved', 'success')}</p>
    ${infoTable([
      ['Booking ID', registration.bookingId],
      ['Amount', registration.paymentAmount != null ? `₹${registration.paymentAmount.toLocaleString()}` : '—'],
    ])}
  `
  return { subject, html: emailShell(body, { preheader: 'Your payment has been verified' }) }
}
