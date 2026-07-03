import { NextRequest, NextResponse } from 'next/server'
import { getHomepageContent, updateHomepageContent } from '@/services/cms.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// GET is public — the homepage itself reads this. PUT is admin-only
// (Phase 10 CMS: "Homepage" + "Hero Banner").
export async function GET() {
  const content = await getHomepageContent()
  return NextResponse.json(content)
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const content = await updateHomepageContent(body)
    return NextResponse.json(content)
  } catch (e) {
    return apiError(e)
  }
}
