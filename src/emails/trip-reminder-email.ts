// Phase 6 — "Trip Reminder": sent N days before travelDate for confirmed
// registrations (see registration.service.ts sendTripReminders()). Not
// triggered by a user action — this is meant to be fired by an external
// cron hitting POST /api/registrations/send-reminders (Next.js has no
// built-in background scheduler), see that route for the trigger.
import type { Registration, Package } from '@/types'
import { siteConfig } from '@/config/site'
import { emailShell, heading, infoTable, calloutBox } from './components/layout'

export function tripReminderEmail(registration: Registration, pkg: Package | null, daysLeft: number): { subject: string; html: string } {
  const subject = `${daysLeft <= 1 ? "Tomorrow!" : `${daysLeft} days to go`} — ${registration.packageTitle}`
  const body = `
    ${heading(`Your trip is coming up in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!`)}
    <p>Hi ${registration.name},</p>
    <p>This is a reminder for your upcoming trip: <strong>${registration.packageTitle}</strong>.</p>
    ${infoTable([
      ['Booking ID', registration.bookingId],
      ['Travel date', new Date(registration.travelDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
      ['Persons', String(registration.numPersons)],
    ])}
    ${pkg?.pickupPoints?.length ? calloutBox(`<strong>Pickup points:</strong><br/>${pkg.pickupPoints.join('<br/>')}`, 'info') : ''}
    <p>Please carry a valid government ID and reach your pickup point on time. Call ${siteConfig.contact.primaryPhone} if you have any questions.</p>
  `
  return { subject, html: emailShell(body, { preheader: `Reminder: your trip is in ${daysLeft} days` }) }
}
