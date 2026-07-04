'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, X, HelpCircle } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, adminControl, luxLabel, primaryBtn, ghostBtn, dangerIconBtn, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { FAQItem } from '@/types'

function emptyForm() {
  return { question: '', answer: '', category: '', order: 0, published: true }
}

// Phase 10 CMS — "FAQs". List + modal pattern.
export default function AdminFaqsPage() {
  const { data: faqs, loading, refetch } = useFetch<FAQItem[]>('/api/cms/faqs', [])
  const [editing, setEditing] = useState<FAQItem | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const confirmDialog = useConfirmDialog<FAQItem>()

  function openNew() { setForm(emptyForm()); setEditing('new') }
  function openEdit(f: FAQItem) {
    setForm({ question: f.question, answer: f.answer, category: f.category || '', order: f.order, published: f.published })
    setEditing(f)
  }

  async function save() {
    setSaving(true)
    const isNew = editing === 'new'
    const url = isNew ? '/api/cms/faqs' : `/api/cms/faqs/${(editing as FAQItem)._id}`
    await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setEditing(null)
    refetch()
  }

  async function handleDelete() {
    await confirmDialog.confirm(async (f) => {
      await fetch(`/api/cms/faqs/${f._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/cms" className="flex items-center gap-1.5 text-sm text-gilt-300 hover:underline w-fit"><ArrowLeft size={15} /> Back to CMS</Link>
      <AdminHeader title="FAQs" description={`${faqs.length} question(s)`}>
        <button onClick={openNew} className={primaryBtn}><Plus size={15} /> Add FAQ</button>
      </AdminHeader>

      {loading ? (
        <AdminLoading />
      ) : faqs.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No FAQs yet" description="Add your first question to show it on the public FAQ page." />
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f._id} className="rounded-3xl glass gilt-border p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white">{f.question}</span>
                  {f.category && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{f.category}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/60'}`}>{f.published ? 'Published' : 'Hidden'}</span>
                </div>
                <p className="text-sm text-white/60 mt-1">{f.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(f)} className={ghostBtn}>Edit</button>
                <button onClick={() => confirmDialog.ask(f)} className={dangerIconBtn} title="Delete"><Trash2 size={16} /></button>
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
              <h3 className="text-base font-semibold text-white">{editing === 'new' ? 'Add FAQ' : 'Edit FAQ'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <div><label className={luxLabel}>Question *</label><input className={`${adminControl} w-full`} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
            <div><label className={luxLabel}>Answer *</label><textarea rows={3} className={`${adminControl} w-full`} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={luxLabel}>Category</label><input className={`${adminControl} w-full`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><label className={luxLabel}>Order</label><input type="number" className={`${adminControl} w-full`} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-gilt-500" /> Published (visible on /faqs)
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button className={ghostBtn} onClick={() => setEditing(null)}>Cancel</button>
              <button className={primaryBtn} disabled={saving || !form.question || !form.answer} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmDialog.isOpen} title="Delete this FAQ?" loading={confirmDialog.loading} onConfirm={handleDelete} onCancel={confirmDialog.cancel} />
    </div>
  )
}
