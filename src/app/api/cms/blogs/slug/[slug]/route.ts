import { NextRequest, NextResponse } from 'next/server'
import { getBlogBySlug } from '@/services/cms.service'
import { getCurrentUser } from '@/lib/auth-guard'

// Public blog detail page — only exposes published posts unless the
// requester is an admin (draft-preview), same rule as the Package detail
// route.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  if (!blog) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })

  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'
  if (!isAdmin && blog.status !== 'published') {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
  }
  return NextResponse.json(blog)
}
