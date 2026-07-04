import { NextResponse } from 'next/server'
import { getDashboardOverview } from '@/services/dashboard.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Admin-only — same overview src/app/admin/page.tsx renders server-side;
// exposed as its own endpoint too so a future "refresh without reload"
// button (or any other admin-only surface) can pull the same numbers
// without duplicating the aggregation logic in dashboard.service.ts.
export async function GET() {
  try {
    await requireRole('admin')
    const overview = await getDashboardOverview()
    return NextResponse.json(overview)
  } catch (e) {
    return apiError(e)
  }
}
