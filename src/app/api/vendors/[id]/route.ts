import { NextRequest, NextResponse } from 'next/server'
import { updateVendor, deleteVendor } from '@/services/vendor.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin')
    const { id } = await params
    const body = await req.json()
    const vendor = await updateVendor(id, body)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    return NextResponse.json(vendor)
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin')
    const { id } = await params
    await deleteVendor(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
