import { NextRequest, NextResponse } from 'next/server'
import { sendTripReminders } from '@/services/registration.service'
import { getCurrentUser } from '@/lib/auth-guard'
import { env } from '@/config/env'

export const dynamic = 'force-dynamic'

// Trip Reminder trigger — Next.js has no built-in background scheduler,
// so this route is meant to be hit once a day by a free external cron
// (Vercel Cron / a GitHub Actions scheduled workflow / cron-job.org).
// Two ways in: a matching x-cron-secret header (for the unattended
// external trigger) or an authenticated admin session (so it's also
// testable by hand from the dashboard without configuring CRON_SECRET
// first) — see the "Send Trip Reminders Now" button in
// app/admin/registrations/page.tsx.
export async function POST(req: NextRequest) {
  const cronHeader = req.headers.get('x-cron-secret')
  const hasCronSecret = !!env.cronSecret && cronHeader === env.cronSecret

  if (!hasCronSecret) {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const { searchParams } = req.nextUrl
  const daysBefore = Number(searchParams.get('daysBefore')) || 3
  const result = await sendTripReminders(daysBefore)
  return NextResponse.json(result)
}
