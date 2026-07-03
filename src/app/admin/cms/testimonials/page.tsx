'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Testimonial } from '@/types'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

function emptyForm() {
  return { name: '', location: '', rating: 5, message: '', avatar: '', published: true, order: 0 }
}

// Phase 10 CMS — "Testimonials". Same list+modal-form pattern as
// admin/gallery/page.tsx, extended with an edit mode (gallery only ever
// adds/deletes).
export default function AdminTestimonialsPage() {
  const { data: testimonials, loading, refetch } = useFetch<Testimonial[]>('/api/cms/testimonials', [])
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const confirmDialog = useConfirmDialog<Testimonial>()

  function openNew() {
    setForm(emptyForm())
    setEditing('new')
  }
  function openEdit(t: Testimonial) {
    setForm({ name: t.name, location: t.location || '', rating: t.rating, message: t.message, avatar: t.avatar || '', published: t.published, order: t.order })
    setEditing(t)
  }

  async function save() {
    setSaving(true)
    const isNew = editing === 'new'
    const url = isNew ? '/api/cms/testimonials' : `/api/cms/testimonials/${(editing as Testimonial)._id}`
    await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setEditing(null)
    refetch()
  }

  async function handleDelete() {
    await confirmDialog.confirm(async (t) => {
      await fetch(`/api/cms/testimonials/${t._id}`, { method: 'DELETE' })
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
          <h1 className="text-2xl font-bold text-gray-800">Testimonials</h1>
          <p className="text-gray-500 text-sm">{testimonials.length} testimonial(s)</p>
        </div>
        <Button onClick={openNew}><Plus size={15} className="mr-1" /> Add Testimonial</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No testimonials yet.</div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t._id} className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{t.name}</span>
                  {t.location && <span className="text-xs text-gray-400">· {t.location}</span>}
                  <span className="flex items-center gap-0.5 text-amber-400 text-xs">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </span>
                  <Badge variant={t.published ? 'success' : 'secondary'}>{t.published ? 'Published' : 'Hidden'}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1 italic">&quot;{t.message}&quot;</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Edit</Button>
                <button onClick={() => confirmDialog.ask(t)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">{editing === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Rating (1-5)</label>
              <input type="number" min={1} max={5} className={inputClass} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </div>
            <div>
              <label className={labelClass}>Message *</label>
              <textarea rows={3} className={inputClass} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Avatar URL (optional)</label>
              <input className={inputClass} value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <label htmlFor="published" className="text-sm text-gray-700">Published (visible on homepage)</label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button disabled={saving || !form.name || !form.message} onClick={save}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this testimonial?"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
