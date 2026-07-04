// Phase 12 (architecture-only) — extension point, not an implementation.
//
// Today `lib/mailer.ts` is the only outbound-communication channel
// (email), called directly from registration.service.ts / auth.service.ts
// wherever a notification needs to go out. That's fine while there's one
// channel, but "WhatsApp Notifications" and "SMS Notifications" (Phase 12
// future modules list) would otherwise mean scattering
// `if (smsEnabled) ... else if (whatsappEnabled) ...` branches through
// every service that currently calls sendMail().
//
// The shape below is the contract every channel (email today, WhatsApp/SMS
// later) would implement, so calling code depends on `NotificationChannel`
// rather than on nodemailer or a specific provider SDK. When WhatsApp/SMS
// are actually built:
//   1. Add a WhatsAppChannel / SmsChannel class implementing this
//      interface (e.g. wrapping the WhatsApp Business API or Twilio).
//   2. Register it in a small channel registry (by NotificationChannelType).
//   3. Existing sendMail() call sites are migrated one at a time, or left
//      as-is — this is additive, not a rewrite of the mailer.
//
// No code currently implements or consumes this interface.

export type NotificationChannelType = 'email' | 'whatsapp' | 'sms'

export interface NotificationMessage {
  /** Recipient address: email address, E.164 phone number, etc. */
  to: string
  subject?: string
  body: string
  /** Optional HTML body, meaningful for the 'email' channel only. */
  html?: string
}

export interface NotificationResult {
  channel: NotificationChannelType
  success: boolean
  /** Provider message id, when the channel/provider returns one. */
  providerMessageId?: string
  error?: string
}

export interface NotificationChannel {
  readonly type: NotificationChannelType
  send(message: NotificationMessage): Promise<NotificationResult>
}
