'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Blog, BlogStatus } from '@/types'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

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
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Slug (leave blank to auto-generate from title)</label>
            <input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-if-blank" />
          </div>
          <div>
            <label className={labelClass}>Excerpt *</label>
            <textarea rows={2} className={inputClass} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Content *</label>
            <textarea rows={10} className={inputClass} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Cover Image URL</label>
            <input className={inputClass} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Author</label>
              <input className={inputClass} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BlogStatus })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Meta Title (SEO)</label>
            <input className={inputClass} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Meta Description (SEO)</label>
            <textarea rows={2} className={inputClass} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </div>
        </CardContent>
      </Card>
      <Button onClick={save} disabled={saving || !form.title || !form.excerpt || !form.content} className="w-full">
        {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Post'}
      </Button>
    </div>
  )
}
