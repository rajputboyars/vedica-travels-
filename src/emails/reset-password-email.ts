import { siteConfig } from '@/config/site'
import { emailShell, heading, button } from './components/layout'

export function resetPasswordEmail(name: string, resetUrl: string): { subject: string; html: string } {
  const subject = `Reset your password — ${siteConfig.name}`
  const body = `
    ${heading('Reset your password')}
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click below to choose a new one:</p>
    ${button('Reset Password', resetUrl)}
    <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `
  return { subject, html: emailShell(body, { preheader: 'Reset your password' }) }
}
