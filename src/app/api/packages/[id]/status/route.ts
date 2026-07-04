import { NextRequest, NextResponse } from 'next/server'
import { setPackageStatus } from '@/services/package.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'
import type { PackageStatus } from '@/types'

const VALID: PackageStatus[] = ['draft', 'published', 'hidden']

// Separate endpoint (rather than folding into PUT .../[id]) so the admin
// UI's publish/unpublish/hide toggle is a single small, auditable action
// instead of a full-form resubmission, and so a future admin activity log
// can hook this one route to record "who changed status when".
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const { status } = await req.json()
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const pkg = await setPackageStatus(id, status)
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    return NextResponse.json(pkg)
  } catch (e) {
    return apiError(e)
  }
}
