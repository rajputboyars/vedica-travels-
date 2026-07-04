// Phase 7 — sent instead of registrationReceivedEmail's normal "seat
// reserved" framing when the package was full at registration time (see
// createRegistration()'s seat check in registration.service.ts).
import type { Registration } from '@/types'
import { siteConfig } from '@/config/site'
import { emailShell, heading, monoCode, infoTable, badge, calloutBox } from './components/layout'

export function waitlistedEmail(registration: Registration): { subject: string; html: string } {
  const subject = `You're on the waiting list — ${registration.bookingId}`
  const body = `
    ${heading("You're on the Waiting List")}
    <p>Hi ${registration.name},</p>
    <p><strong>${registration.packageTitle}</strong> is currently full, so we've placed your registration on the waiting list rather than reserving a seat.</p>
    <p style="margin:12px 0;">${badge('Waiting List', 'warning')}</p>
    ${infoTable([
      ['Booking ID', registration.bookingId],
      ['Persons', String(registration.numPersons)],
    ])}
    <p>${monoCode(registration.bookingId)}</p>
    ${calloutBox("No payment is needed yet — we'll email you the moment a seat opens up so you can complete payment.", 'info')}
    <p>${siteConfig.tagline}<br/>${siteConfig.contact.primaryPhone}</p>
  `
  return { subject, html: emailShell(body, { preheader: "You're on the waiting list" }) }
}
