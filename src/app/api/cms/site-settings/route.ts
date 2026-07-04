import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSettings } from '@/services/cms.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// GET is public — contact info/social links/stats power the Navbar,
// Footer, and Contact page for every visitor. PUT is admin-only (Phase 10
// CMS: "Contact Information" + "Social Media").
export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const settings = await updateSiteSettings(body)
    return NextResponse.json(settings)
  } catch (e) {
    return apiError(e)
  }
}
