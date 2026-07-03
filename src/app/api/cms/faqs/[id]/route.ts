import { NextRequest, NextResponse } from 'next/server'
import { updateFAQ, deleteFAQ } from '@/services/cms.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const body = await req.json()
    const faq = await updateFAQ(id, body)
    if (!faq) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    return NextResponse.json(faq)
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    await deleteFAQ(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
