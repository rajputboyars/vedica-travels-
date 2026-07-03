// Single source of truth for reading environment variables. Anything that
// reaches into process.env directly outside this file is a code-review flag —
// centralizing it here means a missing/renamed env var fails in one place
// with a clear error, and `isDBConfigured` / `isMailConfigured` are each
// defined exactly once.

function optional(name: string): string | undefined {
  return process.env[name] || undefined
}

export const env = {
  mongodbUri: optional('MONGODB_URI'),
  nextAuthUrl: optional('NEXTAUTH_URL'),
  nextAuthSecret: optional('NEXTAUTH_SECRET'),
  adminEmail: optional('ADMIN_EMAIL'),
  adminPassword: optional('ADMIN_PASSWORD'),

  // Custom MongoDB + JWT auth system (registration/login/roles). Separate
  // secret from NEXTAUTH_SECRET on purpose — the two auth systems
  // (next-auth for the legacy admin login, this one for registered users)
  // are independent modules and shouldn't share a signing key.
  jwtSecret: optional('JWT_SECRET') || 'dev-insecure-jwt-secret-change-me',
  jwtExpiresIn: optional('JWT_EXPIRES_IN') || '30d',

  // Outbound email (verification + password reset). Free/open-source
  // (nodemailer) talking to any SMTP provider — no paid email API.
  smtpHost: optional('SMTP_HOST'),
  smtpPort: optional('SMTP_PORT'),
  smtpUser: optional('SMTP_USER'),
  smtpPassword: optional('SMTP_PASSWORD'),
  smtpFrom: optional('SMTP_FROM') || 'no-reply@parthsaarthitravels.com',

  appUrl: optional('APP_URL') || optional('NEXTAUTH_URL') || 'http://localhost:3000',

  // Phase 6 trip reminders: Next.js/Vercel serverless has no built-in
  // background scheduler, so POST /api/registrations/send-reminders is
  // meant to be triggered by a free external cron (Vercel Cron, a GitHub
  // Actions scheduled workflow, or cron-job.org all work at no cost).
  // This shared secret lets that external caller authenticate without an
  // admin login session — sent as the `x-cron-secret` header. Optional:
  // if unset, the route still accepts a logged-in admin session instead,
  // so it stays testable from the dashboard even before this is configured.
  cronSecret: optional('CRON_SECRET'),
}

// The app runs in two modes:
//  - DB mode: MONGODB_URI is set, all reads/writes hit MongoDB via Mongoose.
//  - Demo mode: no MONGODB_URI, an in-memory store + seed data stand in so
//    the full booking/admin flow can still be demoed (e.g. local dev, or a
//    preview deploy without a database provisioned yet).
// Services check this flag — nothing else in the codebase should.
export const isDBConfigured = !!env.mongodbUri

// Same idea for outbound mail: without SMTP creds configured, mailer.ts
// logs the email to the console instead of sending it, so registration/
// password-reset flows are still fully testable in local/demo setups.
export const isMailConfigured = !!(env.smtpHost && env.smtpUser && env.smtpPassword)
