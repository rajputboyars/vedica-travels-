import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BlogForm from '@/features/cms/components/BlogForm'

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/cms/blogs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to Blogs
      </Link>
      <h1 className="text-2xl font-bold text-gray-800">New Blog Post</h1>
      <BlogForm />
    </div>
  )
}
