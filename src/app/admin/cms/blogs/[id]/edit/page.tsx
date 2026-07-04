import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BlogForm from '@/features/cms/components/BlogForm'
import { getBlog } from '@/services/cms.service'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const blog = await getBlog(id)
  if (!blog) notFound()

  return (
    <div className="space-y-6">
      <Link href="/admin/cms/blogs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to Blogs
      </Link>
      <h1 className="text-2xl font-bold text-gray-800">Edit Blog Post</h1>
      <BlogForm initial={blog} />
    </div>
  )
}
