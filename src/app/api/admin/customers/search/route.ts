import { NextRequest, NextResponse } from 'next/server'
import { searchCustomers } from '@/services/dashboard.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Phase 8 — "Customer Search". Admin-only: results include contact PII.
export async function GET(req: NextRequest) {
  try {
    await requireRole('admin')
    const q = req.nextUrl.searchParams.get('q') || ''
    if (!q.trim()) return NextResponse.json([])
    const results = await searchCustomers(q)
    return NextResponse.json(results)
  } catch (e) {
    return apiError(e)
  }
}
