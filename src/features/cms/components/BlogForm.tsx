'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
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
    <div className="space-y-4">
      {error && <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm rounded-xl px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
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
                <textarea rows={14} className={`${adminControl} w-full`} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
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
                <label className={luxLabel}>Meta Title (SEO)</label>
                <input className={`${adminControl} w-full`} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
              </div>
              <div>
                <label className={luxLabel}>Meta Description (SEO)</label>
                <textarea rows={2} className={`${adminControl} w-full`} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
              </div>
            </div>
          </Panel>
        </div>

        {/* Sticky sidebar — cover preview + status + pinned publish action,
            so the wide admin canvas isn't left empty next to a narrow form. */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Panel title="Preview">
            <div className="relative h-36 rounded-2xl overflow-hidden border border-white/5 bg-white/[0.03]">
              {form.coverImage ? (
                <Image src={form.coverImage} alt="" fill sizes="360px" className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-white/25"><ImageIcon size={28} /></div>
              )}
            </div>
            <div className="mt-3 font-display text-base font-semibold text-white leading-snug line-clamp-2">{form.title || 'Untitled post'}</div>
            {form.excerpt && <p className="mt-1 text-xs text-white/50 line-clamp-3">{form.excerpt}</p>}
          </Panel>

          <Panel title="Publish">
            <div className="space-y-3">
              <div>
                <label className={luxLabel}>Status</label>
                <select className={`${adminControl} w-full`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BlogStatus })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <button onClick={save} disabled={saving || !form.title || !form.excerpt || !form.content} className={`${primaryBtn} w-full`}>
                {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
