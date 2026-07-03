import { NextRequest, NextResponse } from 'next/server'
import { listPackages, createPackage } from '@/services/package.service'
import { getCurrentUser, requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'
import type { PackageCategory, PackageStatus } from '@/types'

export const dynamic = 'force-dynamic'

// Public GET, admin-only mutation — same shape as /api/tours, but this
// endpoint additionally uses the Phase 2 JWT auth module to decide which
// packages are visible: anonymous/customer requests only ever see
// published, non-archived packages (so drafts/hidden packages never leak
// through the public site), while an authenticated admin can pass
// `status`/`includeArchived` query params to see everything.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const category = (searchParams.get('category') as PackageCategory) || undefined
  const admin = await getCurrentUser()
  const isAdmin = admin?.role === 'admin'

  const status = isAdmin ? ((searchParams.get('status') as PackageStatus) || undefined) : 'published'
  const includeArchived = isAdmin ? searchParams.get('includeArchived') === 'true' : false

  const packages = await listPackages({ category, status, includeArchived })
  return NextResponse.json(packages)
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const pkg = await createPackage(body)
    return NextResponse.json(pkg, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
