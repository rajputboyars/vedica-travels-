import { NextRequest, NextResponse } from 'next/server'
import { getPackage, updatePackage, deletePackage } from '@/services/package.service'
import { getCurrentUser, requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

// GET is public (same reasoning as the collection route: a customer-facing
// package detail page needs to read a package by id), but only exposes it
// when published/non-archived unless the requester is an admin — so a
// draft or hidden package's URL isn't a way to bypass visibility rules.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pkg = await getPackage(id)
  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'
  if (!isAdmin && (pkg.status !== 'published' || pkg.isArchived)) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }
  return NextResponse.json(pkg)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const body = await req.json()
    const pkg = await updatePackage(id, body)
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    return NextResponse.json(pkg)
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    await deletePackage(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
