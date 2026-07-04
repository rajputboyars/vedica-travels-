import { NextRequest, NextResponse } from 'next/server'
import { listTestimonials, createTestimonial } from '@/services/cms.service'
import { getCurrentUser, requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

// GET is public but only returns published testimonials unless the
// requester is an admin (same "published unless admin" pattern as the
// Package detail route) — the homepage testimonials section and the
// admin CMS list both hit this one endpoint.
export async function GET() {
  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'
  const testimonials = await listTestimonials({ publishedOnly: !isAdmin })
  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const testimonial = await createTestimonial(body)
    return NextResponse.json(testimonial, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
