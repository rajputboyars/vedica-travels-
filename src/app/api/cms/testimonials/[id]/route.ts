import { NextRequest, NextResponse } from 'next/server'
import { updateTestimonial, deleteTestimonial } from '@/services/cms.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const body = await req.json()
    const testimonial = await updateTestimonial(id, body)
    if (!testimonial) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    return NextResponse.json(testimonial)
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    await deleteTestimonial(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
