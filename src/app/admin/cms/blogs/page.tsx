'use client'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Newspaper } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, PrimaryLink, ghostBtn, dangerIconBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Blog } from '@/types'

// Phase 10 CMS — "Blogs" list. Create/Edit happen on their own pages.
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
      <Link href="/admin/cms" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit">
        <ArrowLeft size={15} /> Back to CMS
      </Link>
      <AdminHeader title="Blogs" description={`${blogs.length} post(s)`}>
        <PrimaryLink href="/admin/cms/blogs/new" icon={Plus}>New Post</PrimaryLink>
      </AdminHeader>

      {loading ? (
        <AdminLoading />
      ) : blogs.length === 0 ? (
        <EmptyState icon={Newspaper} title="No blog posts yet" description="Write your first article to publish it on the site." action={{ label: 'New Post', href: '/admin/cms/blogs/new' }} />
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <div key={b._id} className="rounded-3xl glass gilt-border p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white">{b.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.status === 'published' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}>{b.status === 'published' ? 'Published' : 'Draft'}</span>
                </div>
                <div className="text-xs text-white/40 font-mono mt-0.5">/{b.slug}</div>
                <p className="text-sm text-white/55 mt-1 line-clamp-2">{b.excerpt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/cms/blogs/${b._id}/edit`} className={ghostBtn}>Edit</Link>
                <button onClick={() => confirmDialog.ask(b)} className={dangerIconBtn} title="Delete"><Trash2 size={16} /></button>
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
