'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Star, X, MessageSquareQuote } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, adminControl, luxLabel, primaryBtn, ghostBtn, dangerIconBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { Testimonial } from '@/types'

function emptyForm() {
  return { name: '', location: '', rating: 5, message: '', avatar: '', published: true, order: 0 }
}

// Phase 10 CMS — "Testimonials". List + modal-form pattern.
export default function AdminTestimonialsPage() {
  const { data: testimonials, loading, refetch } = useFetch<Testimonial[]>('/api/cms/testimonials', [])
  const [editing, setEditing] = useState<Testimonial | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const confirmDialog = useConfirmDialog<Testimonial>()

  function openNew() { setForm(emptyForm()); setEditing('new') }
  function openEdit(t: Testimonial) {
    setForm({ name: t.name, location: t.location || '', rating: t.rating, message: t.message, avatar: t.avatar || '', published: t.published, order: t.order })
    setEditing(t)
  }

  async function save() {
    setSaving(true)
    const isNew = editing === 'new'
    const url = isNew ? '/api/cms/testimonials' : `/api/cms/testimonials/${(editing as Testimonial)._id}`
    await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
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
      <Link href="/admin/cms" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit"><ArrowLeft size={15} /> Back to CMS</Link>
      <AdminHeader title="Testimonials" description={`${testimonials.length} testimonial(s)`}>
        <button onClick={openNew} className={primaryBtn}><Plus size={15} /> Add Testimonial</button>
      </AdminHeader>

      {loading ? (
        <AdminLoading />
      ) : testimonials.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="No testimonials yet" description="Add customer reviews to feature them on the homepage." />
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t._id} className="rounded-3xl glass gilt-border p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white">{t.name}</span>
                  {t.location && <span className="text-xs text-white/40">· {t.location}</span>}
                  <span className="flex items-center gap-0.5 text-gilt-300 text-xs">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}>{t.published ? 'Published' : 'Hidden'}</span>
                </div>
                <p className="text-sm text-white/60 mt-1 italic">&quot;{t.message}&quot;</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className={ghostBtn}>Edit</button>
                <button onClick={() => confirmDialog.ask(t)} className={dangerIconBtn} title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative glass-strong gilt-border rounded-3xl w-full max-w-md p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{editing === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={luxLabel}>Name *</label><input className={`${adminControl} w-full`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className={luxLabel}>Location</label><input className={`${adminControl} w-full`} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div><label className={luxLabel}>Rating (1-5)</label><input type="number" min={1} max={5} className={`${adminControl} w-full`} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            <div><label className={luxLabel}>Message *</label><textarea rows={3} className={`${adminControl} w-full`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div><label className={luxLabel}>Avatar URL (optional)</label><input className={`${adminControl} w-full`} value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-gilt-500" /> Published (visible on homepage)
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button className={ghostBtn} onClick={() => setEditing(null)}>Cancel</button>
              <button className={primaryBtn} disabled={saving || !form.name || !form.message} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmDialog.isOpen} title="Delete this testimonial?" loading={confirmDialog.loading} onConfirm={handleDelete} onCancel={confirmDialog.cancel} />
    </div>
  )
}
