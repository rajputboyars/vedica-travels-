import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BlogForm from '@/features/cms/components/BlogForm'
import { AdminHeader } from '@/features/admin/components/ui'
import { getBlog } from '@/services/cms.service'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blog = await getBlog(id)
  if (!blog) notFound()

  return (
    <div className="space-y-6">
      <Link href="/admin/cms/blogs" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit">
        <ArrowLeft size={15} /> Back to Blogs
      </Link>
      <AdminHeader title="Edit Blog Post" />
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 ring-1 ring-gilt-500/20">
        <BlogForm initial={blog} />
      </div>
    </div>
  )
}
