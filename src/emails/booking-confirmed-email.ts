// Phase 6 — "Booking Confirmed": the fuller "you're all set" email sent
// alongside payment-verified-email.ts when an admin approves payment.
// Kept as a separate template (rather than folding into
// paymentVerifiedEmail) because it's about the trip, not the payment —
// a future flow (e.g. a manually-confirmed walk-in booking with no
// online payment step at all) can send this on its own.
import type { Registration, Package } from '@/types'
import { siteConfig } from '@/config/site'
import { emailShell, heading, monoCode, infoTable, badge, calloutBox } from './components/layout'

export function bookingConfirmedEmail(registration: Registration, pkg: Package | null): { subject: string; html: string } {
  const subject = `You're confirmed! — ${registration.packageTitle}`
  const body = `
    ${heading('Booking Confirmed', '#16a34a')}
    <p>Hi ${registration.name},</p>
    <p>Your booking for <strong>${registration.packageTitle}</strong> is now:</p>
    <p style="margin:12px 0;">${badge('Confirmed', 'success')}</p>
    <p>${monoCode(registration.bookingId)}</p>
    ${infoTable([
      ['Persons', String(registration.numPersons)],
      ['Travel date', new Date(registration.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Duration', pkg ? `${pkg.duration.days} Days / ${pkg.duration.nights} Nights` : '—'],
    ])}
    ${pkg?.pickupPoints?.length ? calloutBox(`<strong>Pickup points:</strong><br/>${pkg.pickupPoints.join('<br/>')}`, 'info') : ''}
    <p>We'll send a reminder with final details closer to your travel date. ${siteConfig.tagline}</p>
  `
  return { subject, html: emailShell(body, { preheader: 'Your booking is confirmed' }) }
}
