import { NextRequest, NextResponse } from 'next/server'
import { createVendor } from '@/services/vendor.service'
import { listVendorsWithTotals } from '@/services/finance.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// Travel Finance module — Vendor management. GET returns vendors with their
// derived billed/paid/pending totals; POST creates a vendor. Admin-only.
export async function GET() {
  try {
    await requireRole('admin')
    return NextResponse.json(await listVendorsWithTotals())
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const vendor = await createVendor(body)
    return NextResponse.json(vendor, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
