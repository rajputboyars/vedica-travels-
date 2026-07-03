// Phase 4 — sent to the customer immediately after they submit the
// registration form, before any payment has happened. Rebuilt on the
// Phase 6 shared component system.
import type { Registration, Package } from '@/types'
import { siteConfig } from '@/config/site'
import { emailShell, heading, monoCode, infoTable, calloutBox, badge } from './components/layout'

export function registrationReceivedEmail(registration: Registration, pkg: Package | null): { subject: string; html: string } {
  const subject = `${siteConfig.name} — Registration ${registration.bookingId} received`
  const paymentNote = pkg?.paymentNote || `Please call ${siteConfig.contact.primaryPhone} for payment instructions.`
  const body = `
    ${heading('Registration received')}
    <p>Hi ${registration.name},</p>
    <p>Thanks for registering for <strong>${registration.packageTitle}</strong>. Your booking ID is:</p>
    <p>${monoCode(registration.bookingId)}</p>
    <p style="margin:12px 0;">${badge('Pending Payment', 'warning')}</p>
    ${infoTable([
      ['Persons', String(registration.numPersons)],
      ['Travel date', new Date(registration.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Seat status', 'Reserved (temporary)'],
    ])}
    ${calloutBox(`<strong>How to pay:</strong><br/>${paymentNote}`, 'info')}
    <p>Once we receive your payment screenshot, we'll verify it and confirm your seat. No online payment gateway is used — this is a manual verification process.</p>
  `
  return { subject, html: emailShell(body, { preheader: `Booking ${registration.bookingId} received — pending payment` }) }
}
