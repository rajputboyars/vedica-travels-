import { NextRequest, NextResponse } from 'next/server'
import { listBlogs, createBlog } from '@/services/cms.service'
import { getCurrentUser, requireRole } from '@/lib/auth-guard'
import { apiError } from '@/lib/api-error'
import type { BlogStatus } from '@/types'

export const dynamic = 'force-dynamic'

// GET is public but only returns published posts unless the requester is
// an admin — the public /blogs list and the admin CMS blogs list both
// hit this one endpoint (admin can additionally filter by ?status=).
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const isAdmin = user?.role === 'admin'
  const { searchParams } = req.nextUrl
  const status = isAdmin ? ((searchParams.get('status') as BlogStatus) || undefined) : 'published'
  const tag = searchParams.get('tag') || undefined
  const blogs = await listBlogs({ status, tag })
  return NextResponse.json(blogs)
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('admin')
    const body = await req.json()
    const blog = await createBlog(body)
    return NextResponse.json(blog, { status: 201 })
  } catch (e) {
    return apiError(e)
  }
}
