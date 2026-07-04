import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BlogForm from '@/features/cms/components/BlogForm'
import { AdminHeader } from '@/features/admin/components/ui'

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/cms/blogs" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit">
        <ArrowLeft size={15} /> Back to Blogs
      </Link>
      <AdminHeader title="New Blog Post" />
      <div className="rounded-3xl bg-white text-gray-900 p-6 sm:p-8 ring-1 ring-gilt-500/20">
        <BlogForm />
      </div>
    </div>
  )
}
