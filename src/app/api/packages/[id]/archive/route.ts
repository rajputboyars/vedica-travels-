import { NextRequest, NextResponse } from 'next/server'
import { setPackageArchived } from '@/services/package.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

// Archive/unarchive toggle, deliberately independent of the status
// endpoint — see the comment on isArchived in models/Package.ts for why
// these two lifecycle states are kept separate.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const body = await req.json().catch(() => ({}))
    const isArchived = typeof body.isArchived === 'boolean' ? body.isArchived : true
    const pkg = await setPackageArchived(id, isArchived)
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    return NextResponse.json(pkg)
  } catch (e) {
    return apiError(e)
  }
}
