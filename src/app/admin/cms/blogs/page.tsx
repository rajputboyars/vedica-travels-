'use client'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Blog } from '@/types'

// Phase 10 CMS — "Blogs" list. Create/Edit happen on their own pages
// (new/[id]/edit) since a blog post's content field is long-form, unlike
// Testimonials/FAQs which fit a small modal.
export default function AdminBlogsPage() {
  const { data: blogs, loading, refetch } = useFetch<Blog[]>('/api/cms/blogs', [])
  const confirmDialog = useConfirmDialog<Blog>()

  async function handleDelete() {
    await confirmDialog.confirm(async (b) => {
      await fetch(`/api/cms/blogs/${b._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/cms" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 w-fit">
        <ArrowLeft size={15} /> Back to CMS
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
          <p className="text-gray-500 text-sm">{blogs.length} post(s)</p>
        </div>
        <Link href="/admin/cms/blogs/new"><Button><Plus size={15} className="mr-1" /> New Post</Button></Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No blog posts yet.</div>
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <div key={b._id} className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{b.title}</span>
                  <Badge variant={b.status === 'published' ? 'success' : 'secondary'}>{b.status === 'published' ? 'Published' : 'Draft'}</Badge>
                </div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">/{b.slug}</div>
                <p className="text-sm text-gray-500 mt-1">{b.excerpt}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/admin/cms/blogs/${b._id}/edit`}><Button size="sm" variant="outline">Edit</Button></Link>
                <button onClick={() => confirmDialog.ask(b)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this blog post?"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
