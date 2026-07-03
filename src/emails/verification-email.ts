import { siteConfig } from '@/config/site'
import { emailShell, heading, button } from './components/layout'

export function verificationEmail(name: string, verifyUrl: string): { subject: string; html: string } {
  const subject = `Verify your email — ${siteConfig.name}`
  const body = `
    ${heading('Verify your email')}
    <p>Hi ${name},</p>
    <p>Thanks for creating an account. Please verify your email address to activate it:</p>
    ${button('Verify Email', verifyUrl)}
    <p style="color:#888;font-size:13px;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
  `
  return { subject, html: emailShell(body, { preheader: 'Verify your email to activate your account' }) }
}
