// Phase 5 — the "Request New Screenshot" admin action: distinct from an
// outright rejection — the payment isn't refused, the proof just needs
// to be clearer/corrected.
import type { Registration } from '@/types'
import { emailShell, heading, calloutBox } from './components/layout'

export function paymentResubmissionRequestedEmail(registration: Registration, reason: string): { subject: string; html: string } {
  const subject = `Please resend your payment screenshot — ${registration.bookingId}`
  const body = `
    ${heading('One More Thing', '#d97706')}
    <p>Hi ${registration.name},</p>
    <p>We received your payment submission for <strong>${registration.packageTitle}</strong> (Booking ID: ${registration.bookingId}), but need a new screenshot before we can verify it.</p>
    ${calloutBox(`<strong>Note from our team:</strong> ${reason}`, 'warning')}
    <p>Your seat is still temporarily held — please submit an updated screenshot from your booking page at your earliest convenience.</p>
  `
  return { subject, html: emailShell(body, { preheader: 'Please resubmit your payment screenshot' }) }
}
