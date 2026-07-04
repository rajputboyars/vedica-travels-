import nodemailer from 'nodemailer'
import { env, isMailConfigured } from '@/config/env'

export interface MailMessage {
  to: string
  subject: string
  html: string
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: Number(env.smtpPort) || 587,
      secure: Number(env.smtpPort) === 465,
      auth: { user: env.smtpUser, pass: env.smtpPassword },
    })
  }
  return transporter
}

// Sends real mail when SMTP_* env vars are set (any standard SMTP
// provider — free-tier Gmail/SES/Mailtrap all work, no paid email API
// required). Without them, logs the email to the console instead so
// registration/reset flows are still fully exercisable in local/demo
// setups — same "demo mode" pattern as the DB layer in config/env.ts.
export async function sendMail(message: MailMessage): Promise<void> {
  if (!isMailConfigured) {
    console.log('[mailer:demo] would send email ->', {
      to: message.to,
      subject: message.subject,
    })
    console.log('[mailer:demo] body:\n', message.html)
    return
  }

  await getTransporter().sendMail({
    from: env.smtpFrom,
    to: message.to,
    subject: message.subject,
    html: message.html,
  })
}
