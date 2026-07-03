import { NextRequest, NextResponse } from 'next/server'
import { getPackageBySlug } from '@/services/package.service'
import { getCurrentUser } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

// SEO-friendly lookup by slug — this is the route a future public
// /packages/[slug] page (and, eventually, the booking flow) should call
// instead of the id-based route, so package URLs stay human-readable.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pkg = await getPackageBySlug(slug)
  if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'
  if (!isAdmin && (pkg.status !== 'published' || pkg.isArchived)) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }
  return NextResponse.json(pkg)
}
