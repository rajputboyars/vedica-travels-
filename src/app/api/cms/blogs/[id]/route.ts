import { NextRequest, NextResponse } from 'next/server'
import { getBlog, updateBlog, deleteBlog } from '@/services/cms.service'
import { requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'

// Admin-only lookup by raw id (for the edit form). Public reads go through
// /api/cms/blogs/slug/[slug] instead, matching the Package pattern.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const blog = await getBlog(id)
    if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    return NextResponse.json(blog)
  } catch (e) {
    return apiError(e)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    const body = await req.json()
    const blog = await updateBlog(id, body)
    if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    return NextResponse.json(blog)
  } catch (e) {
    return apiError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await requireRole('admin')
    await deleteBlog(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    return apiError(e)
  }
}
