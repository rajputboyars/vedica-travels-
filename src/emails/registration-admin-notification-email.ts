// Phase 4 — sent to the admin (env.adminEmail, falling back to
// siteConfig.contact.email) the moment a new registration comes in.
import type { Registration } from '@/types'
import { emailShell, heading, infoTable, calloutBox } from './components/layout'

export function registrationAdminNotificationEmail(registration: Registration): { subject: string; html: string } {
  const subject = `New registration — ${registration.packageTitle} (${registration.bookingId})`
  const body = `
    ${heading('New Trip Registration')}
    ${infoTable([
      ['Package', registration.packageTitle],
      ['Booking ID', registration.bookingId],
      ['Name', `${registration.name} (${registration.age}, ${registration.gender})`],
      ['Mobile', registration.mobile],
      ['Email', registration.email],
      ['City/State', `${registration.city}, ${registration.state}`],
      ['Persons', String(registration.numPersons)],
      ['Travel date', new Date(registration.travelDate).toLocaleDateString('en-IN')],
    ])}
    ${registration.specialRequests ? calloutBox(`<strong>Special requests:</strong> ${registration.specialRequests}`, 'info') : ''}
    <p style="color:#888;font-size:13px;">Status: Pending Payment — no payment submitted yet. View it in the admin dashboard under Registrations.</p>
  `
  return { subject, html: emailShell(body, { preheader: `New registration for ${registration.packageTitle}` }) }
}
