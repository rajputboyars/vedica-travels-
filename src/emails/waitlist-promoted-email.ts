// Phase 7 — sent when a seat frees up (an admin cancels another booking)
// and the oldest waiting-list registration is auto-promoted to a real,
// temporary "reserved" hold. See cancelRegistration() in
// registration.service.ts.
import type { Registration, Package } from '@/types'
import { emailShell, heading, monoCode, badge, calloutBox } from './components/layout'

export function waitlistPromotedEmail(registration: Registration, pkg: Package | null): { subject: string; html: string } {
  const subject = `A seat opened up! — ${registration.bookingId}`
  const paymentNote = pkg?.paymentNote || 'Please call us for payment instructions.'
  const body = `
    ${heading('A Seat Just Opened Up!', '#16a34a')}
    <p>Hi ${registration.name},</p>
    <p>Good news — a seat has opened up for <strong>${registration.packageTitle}</strong> and it's now reserved for you.</p>
    <p style="margin:12px 0;">${badge('Reserved (Temporary)', 'success')}</p>
    <p>${monoCode(registration.bookingId)}</p>
    ${calloutBox(`<strong>How to pay:</strong><br/>${paymentNote}`, 'info')}
    <p>Please complete payment soon to confirm your seat — it's held temporarily, same as a fresh registration.</p>
  `
  return { subject, html: emailShell(body, { preheader: 'A seat opened up for you' }) }
}
