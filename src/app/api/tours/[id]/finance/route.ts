import { NextRequest, NextResponse } from 'next/server'
import { getTripFinance } from '@/services/finance.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Travel Finance module — computed financial summary for one trip (revenue,
// expenses, profit/loss, break-even, occupancy, collection). Read-only and
// fully derived; no storage of its own.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin')
    const { id } = await params
    const data = await getTripFinance(id)
    if (!data) return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (e) {
    return apiError(e)
  }
}
