'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import type { FAQItem } from '@/types'

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

function emptyForm() {
  return { question: '', answer: '', category: '', order: 0, published: true }
}

// Phase 10 CMS — "FAQs". Same list+modal pattern as the Testimonials page.
export default function AdminFaqsPage() {
  const { data: faqs, loading, refetch } = useFetch<FAQItem[]>('/api/cms/faqs', [])
  const [editing, setEditing] = useState<FAQItem | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const confirmDialog = useConfirmDialog<FAQItem>()

  function openNew() {
    setForm(emptyForm())
    setEditing('new')
  }
  function openEdit(f: FAQItem) {
    setForm({ question: f.question, answer: f.answer, category: f.category || '', order: f.order, published: f.published })
    setEditing(f)
  }

  async function save() {
    setSaving(true)
    const isNew = editing === 'new'
    const url = isNew ? '/api/cms/faqs' : `/api/cms/faqs/${(editing as FAQItem)._id}`
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
    await confirmDialog.confirm(async (f) => {
      await fetch(`/api/cms/faqs/${f._id}`, { method: 'DELETE' })
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
          <h1 className="text-2xl font-bold text-gray-800">FAQs</h1>
          <p className="text-gray-500 text-sm">{faqs.length} question(s)</p>
        </div>
        <Button onClick={openNew}><Plus size={15} className="mr-1" /> Add FAQ</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">No FAQs yet.</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f._id} className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{f.question}</span>
                  {f.category && <Badge variant="secondary">{f.category}</Badge>}
                  <Badge variant={f.published ? 'success' : 'secondary'}>{f.published ? 'Published' : 'Hidden'}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{f.answer}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(f)}>Edit</Button>
                <button onClick={() => confirmDialog.ask(f)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={15} /></button>
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
              <h3 className="text-base font-semibold text-gray-800">{editing === 'new' ? 'Add FAQ' : 'Edit FAQ'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div>
              <label className={labelClass}>Question *</label>
              <input className={inputClass} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Answer *</label>
              <textarea rows={3} className={inputClass} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Category</label>
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input type="number" className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <label htmlFor="published" className="text-sm text-gray-700">Published (visible on /faqs)</label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button disabled={saving || !form.question || !form.answer} onClick={save}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.isOpen}
        title="Delete this FAQ?"
        loading={confirmDialog.loading}
        onConfirm={handleDelete}
        onCancel={confirmDialog.cancel}
      />
    </div>
  )
}
