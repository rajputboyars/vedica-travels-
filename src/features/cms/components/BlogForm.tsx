'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Panel, adminControl, luxLabel, primaryBtn } from '@/features/admin/components/ui'
import type { Blog, BlogStatus } from '@/types'

interface Props {
  initial?: Blog
}

// Shared create/edit form for the admin Blogs CMS section — mirrors
// PackageForm.tsx's "one form, id-presence decides POST vs PUT" pattern.
export default function BlogForm({ initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    coverImage: initial?.coverImage || '',
    author: initial?.author || '',
    tags: initial?.tags.join(', ') || '',
    status: (initial?.status || 'draft') as BlogStatus,
    metaTitle: initial?.metaTitle || '',
    metaDescription: initial?.metaDescription || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setError('')
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }
    const url = initial ? `/api/cms/blogs/${initial._id}` : '/api/cms/blogs'
    const res = await fetch(url, {
      method: initial ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      router.push('/admin/cms/blogs')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to save blog post')
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {error && <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm rounded-xl px-3 py-2">{error}</div>}
      <Panel>
        <div className="space-y-4">
          <div>
            <label className={luxLabel}>Title *</label>
            <input className={`${adminControl} w-full`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={luxLabel}>Slug (leave blank to auto-generate from title)</label>
            <input className={`${adminControl} w-full`} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-if-blank" />
          </div>
          <div>
            <label className={luxLabel}>Excerpt *</label>
            <textarea rows={2} className={`${adminControl} w-full`} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label className={luxLabel}>Content *</label>
            <textarea rows={10} className={`${adminControl} w-full`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className={luxLabel}>Cover Image URL</label>
            <input className={`${adminControl} w-full`} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={luxLabel}>Author</label>
              <input className={`${adminControl} w-full`} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label className={luxLabel}>Tags (comma separated)</label>
              <input className={`${adminControl} w-full`} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={luxLabel}>Status</label>
            <select className={`${adminControl} w-full`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BlogStatus })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className={luxLabel}>Meta Title (SEO)</label>
            <input className={`${adminControl} w-full`} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </div>
          <div>
            <label className={luxLabel}>Meta Description (SEO)</label>
            <textarea rows={2} className={`${adminControl} w-full`} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </div>
        </div>
      </Panel>
      <button onClick={save} disabled={saving || !form.title || !form.excerpt || !form.content} className={`${primaryBtn} w-full`}>
        {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Post'}
      </button>
    </div>
  )
}
