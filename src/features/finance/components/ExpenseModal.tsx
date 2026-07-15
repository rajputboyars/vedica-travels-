'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import { adminControl, luxLabel, primaryBtn, ghostBtn } from '@/features/admin/components/ui'
import { expenseCategoryMeta, vendorTypeMeta } from '@/types'
import type { ComputedExpense, ExpenseCategory, ExpenseType, ExpensePaymentStatus, Vendor, VendorWithTotals } from '@/types'
import { inr } from './FinanceUI'

const CATEGORIES = Object.keys(expenseCategoryMeta) as ExpenseCategory[]

function toForm(e: ComputedExpense | null) {
  return {
    name: e?.name ?? '',
    category: (e?.category ?? 'miscellaneous') as ExpenseCategory,
    description: e?.description ?? '',
    type: (e?.type ?? 'fixed') as ExpenseType,
    quantity: e?.quantity ?? 1,
    rate: e?.rate ?? 0,
    vendorId: e?.vendorId ?? '',
    paymentStatus: (e?.paymentStatus ?? 'pending') as ExpensePaymentStatus,
    amountPaid: e?.amountPaid ?? 0,
    expenseDate: (e?.expenseDate ?? new Date().toISOString()).slice(0, 10),
    notes: e?.notes ?? '',
  }
}

// Add / edit a trip expense. Handles its own POST/PUT and calls onSaved()
// so the finance dashboard refetches (which recomputes all totals).
export default function ExpenseModal({
  tourId,
  editing,
  vendors,
  confirmedPassengers,
  onClose,
  onSaved,
}: {
  tourId: string
  editing: ComputedExpense | 'new'
  vendors: (Vendor | VendorWithTotals)[]
  confirmedPassengers: number
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = editing === 'new'
  const [form, setForm] = useState(() => toForm(isNew ? null : editing))
  const [saving, setSaving] = useState(false)

  const previewTotal = form.type === 'variable' ? form.rate * confirmedPassengers : form.rate * (form.quantity || 1)

  function setCategory(category: ExpenseCategory) {
    // Picking a category nudges the fixed/variable default, but the admin can still override.
    setForm((f) => ({ ...f, category, type: expenseCategoryMeta[category].defaultType }))
  }

  async function save() {
    setSaving(true)
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description || undefined,
      type: form.type,
      quantity: Number(form.quantity) || 1,
      rate: Number(form.rate) || 0,
      vendorId: form.vendorId || undefined,
      paymentStatus: form.paymentStatus,
      amountPaid: Number(form.amountPaid) || 0,
      expenseDate: form.expenseDate,
      notes: form.notes || undefined,
    }
    const url = isNew ? `/api/tours/${tourId}/expenses` : `/api/tours/${tourId}/expenses/${editing._id}`
    await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong gilt-border rounded-3xl w-full max-w-lg p-6 space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{isNew ? 'Add Expense' : 'Edit Expense'}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={luxLabel}>Expense Name *</label>
            <input className={`${adminControl} w-full`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lunch, Bus Rent" />
          </div>
          <div>
            <label className={luxLabel}>Category</label>
            <select className={`${adminControl} w-full`} value={form.category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{expenseCategoryMeta[c].label}</option>)}
            </select>
          </div>
          <div>
            <label className={luxLabel}>Type</label>
            <select className={`${adminControl} w-full`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ExpenseType })}>
              <option value="fixed">Fixed (flat cost)</option>
              <option value="variable">Variable (per passenger)</option>
            </select>
          </div>
          <div>
            <label className={luxLabel}>{form.type === 'variable' ? 'Rate / passenger (₹)' : 'Rate / unit (₹)'}</label>
            <input type="number" className={`${adminControl} w-full`} value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} />
          </div>
          <div>
            <label className={luxLabel}>{form.type === 'variable' ? 'Passengers (auto)' : 'Quantity'}</label>
            <input type="number" disabled={form.type === 'variable'} className={`${adminControl} w-full`} value={form.type === 'variable' ? confirmedPassengers : form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </div>
          <div className="col-span-2 rounded-xl bg-gilt-400/10 border border-gilt-500/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-white/60">Total {form.type === 'variable' ? `(${form.rate} × ${confirmedPassengers} pax)` : ''}</span>
            <span className="font-display text-lg font-semibold gilt-text">{inr(previewTotal)}</span>
          </div>
          <div>
            <label className={luxLabel}>Vendor</label>
            <select className={`${adminControl} w-full`} value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}>
              <option value="">— None —</option>
              {vendors.map((v) => <option key={v._id} value={v._id}>{v.name} ({vendorTypeMeta[v.type].label})</option>)}
            </select>
          </div>
          <div>
            <label className={luxLabel}>Expense Date</label>
            <input type="date" className={`${adminControl} w-full`} value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
          </div>
          <div>
            <label className={luxLabel}>Payment Status</label>
            <select className={`${adminControl} w-full`} value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as ExpensePaymentStatus })}>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className={luxLabel}>Amount Paid (₹)</label>
            <input type="number" className={`${adminControl} w-full`} value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })} />
          </div>
          <div className="col-span-2">
            <label className={luxLabel}>Description / Notes</label>
            <textarea rows={2} className={`${adminControl} w-full`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button className={ghostBtn} onClick={onClose}>Cancel</button>
          <button className={primaryBtn} disabled={saving || !form.name} onClick={save}>{saving ? 'Saving…' : 'Save Expense'}</button>
        </div>
      </div>
    </div>
  )
}
