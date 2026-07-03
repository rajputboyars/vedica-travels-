// Legacy Tour + Booking flow's confirmation email (models/Booking.ts) —
// untouched in behavior/call-site, just rebuilt on the shared component
// system (Phase 6) for visual consistency with every other email.
import type { Booking } from '@/types'
import { siteConfig } from '@/config/site'
import { emailShell, heading, monoCode, infoTable } from './components/layout'

export function bookingConfirmationEmail(booking: Booking): { subject: string; html: string } {
  const subject = `${siteConfig.name} — Booking ${booking.bookingRef} received`
  const body = `
    ${heading('Booking received')}
    <p>Hi ${booking.name},</p>
    <p>Thanks for registering for <strong>${booking.tourTitle}</strong>. Your booking reference is:</p>
    <p>${monoCode(booking.bookingRef)}</p>
    ${infoTable([['Contact number', booking.phone]])}
    <p>We'll verify your payment and call you to confirm.</p>
  `
  return { subject, html: emailShell(body, { preheader: `Booking ${booking.bookingRef} received` }) }
}
