// Phase 5 — "Rejected Flow": sent when an admin rejects a submitted
// payment outright. The reason is required so the customer knows exactly
// what to fix (spec: "Customer receives reason").
import type { Registration } from '@/types'
import { siteConfig } from '@/config/site'
import { emailShell, heading, calloutBox } from './components/layout'

export function paymentRejectedEmail(registration: Registration, reason: string): { subject: string; html: string } {
  const subject = `Payment could not be verified — ${registration.bookingId}`
  const body = `
    ${heading('Payment Not Verified', '#dc2626')}
    <p>Hi ${registration.name},</p>
    <p>We could not verify the payment you submitted for <strong>${registration.packageTitle}</strong> (Booking ID: ${registration.bookingId}).</p>
    ${calloutBox(`<strong>Reason:</strong> ${reason}`, 'danger')}
    <p>Your seat is still temporarily held. Please call ${siteConfig.contact.primaryPhone} or reply with a corrected payment so we can re-verify it.</p>
  `
  return { subject, html: emailShell(body, { preheader: 'Your payment could not be verified' }) }
}
