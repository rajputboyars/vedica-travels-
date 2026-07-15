'use client'
import { useState } from 'react'
import { Plus, Trash2, X, Phone, Mail, Building2 } from 'lucide-react'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import EmptyState from '@/components/lux/EmptyState'
import { AdminHeader, adminControl, luxLabel, primaryBtn, ghostBtn, dangerIconBtn, tableWrap, tableCls, theadCls, thCls, tdCls, rowCls, AdminLoading } from '@/features/admin/components/ui'
import { useFetch } from '@/hooks/use-fetch'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { vendorTypeMeta } from '@/types'
import type { VendorWithTotals, VendorType } from '@/types'

const VENDOR_TYPES = Object.keys(vendorTypeMeta) as VendorType[]
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

function emptyForm() {
  return { name: '', type: 'bus' as VendorType, phone: '', email: '', address: '', bankDetails: '', notes: '' }
}

// Travel Finance module — Vendor Management. Same list + modal pattern as the
// CMS testimonial/FAQ managers. Billed/paid/pending totals come pre-computed
// from the API (derived from linked expenses).
export default function AdminVendorsPage() {
  const { data: vendors, loading, refetch } = useFetch<VendorWithTotals[]>('/api/vendors', [])
  const [editing, setEditing] = useState<VendorWithTotals | 'new' | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const confirmDialog = useConfirmDialog<VendorWithTotals>()

  function openNew() { setForm(emptyForm()); setEditing('new') }
  function openEdit(v: VendorWithTotals) {
    setForm({ name: v.name, type: v.type, phone: v.phone || '', email: v.email || '', address: v.address || '', bankDetails: v.bankDetails || '', notes: v.notes || '' })
    setEditing(v)
  }

  async function save() {
    setSaving(true)
    const isNew = editing === 'new'
    const url = isNew ? '/api/vendors' : `/api/vendors/${(editing as VendorWithTotals)._id}`
    await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setEditing(null)
    refetch()
  }

  async function handleDelete() {
    await confirmDialog.confirm(async (v) => {
      await fetch(`/api/vendors/${v._id}`, { method: 'DELETE' })
      refetch()
    })
  }

  const totalPending = vendors.reduce((s, v) => s + v.pendingAmount, 0)

  return (
    <div className="space-y-6">
      <AdminHeader title="Vendors" description={`${vendors.length} vendor(s) · ${inr(totalPending)} pending across all trips`}>
        <button onClick={openNew} className={primaryBtn}><Plus size={15} /> Add Vendor</button>
      </AdminHeader>

      {loading ? (
        <AdminLoading />
      ) : vendors.length === 0 ? (
        <EmptyState icon={Building2} title="No vendors yet" description="Add bus owners, hotels, restaurants and guides you pay trip costs to." />
      ) : (
        <div className={tableWrap}>
          <table className={tableCls}>
            <thead className={theadCls}>
              <tr>
                <th className={thCls}>Vendor</th>
                <th className={`${thCls} hidden sm:table-cell`}>Contact</th>
                <th className={`${thCls} hidden md:table-cell`}>Expenses</th>
                <th className={thCls}>Billed</th>
                <th className={thCls}>Pending</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id} className={rowCls}>
                  <td className={tdCls}>
                    <div className="font-medium text-white">{v.name}</div>
                    <div className="text-xs text-white/40">{vendorTypeMeta[v.type].label}</div>
                  </td>
                  <td className={`${tdCls} hidden sm:table-cell text-xs text-white/60`}>
                    {v.phone && <div className="flex items-center gap-1"><Phone size={11} />{v.phone}</div>}
                    {v.email && <div className="flex items-center gap-1 mt-0.5"><Mail size={11} />{v.email}</div>}
                    {!v.phone && !v.email && '—'}
                  </td>
                  <td className={`${tdCls} hidden md:table-cell text-white/60`}>{v.expenseCount}</td>
                  <td className={`${tdCls} text-white/80`}>{inr(v.totalBilled)}</td>
                  <td className={tdCls}>
                    {v.pendingAmount > 0
                      ? <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/15 text-amber-300">{inr(v.pendingAmount)}</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-300">Cleared</span>}
                  </td>
                  <td className={tdCls}>
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(v)} className={ghostBtn}>Edit</button>
                      <button onClick={() => confirmDialog.ask(v)} className={dangerIconBtn} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative glass-strong gilt-border rounded-3xl w-full max-w-md p-6 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{editing === 'new' ? 'Add Vendor' : 'Edit Vendor'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/50 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className={luxLabel}>Name *</label><input className={`${adminControl} w-full`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className={luxLabel}>Type</label><select className={`${adminControl} w-full`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VendorType })}>{VENDOR_TYPES.map((t) => <option key={t} value={t}>{vendorTypeMeta[t].label}</option>)}</select></div>
              <div><label className={luxLabel}>Phone</label><input className={`${adminControl} w-full`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="col-span-2"><label className={luxLabel}>Email</label><input className={`${adminControl} w-full`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="col-span-2"><label className={luxLabel}>Address</label><input className={`${adminControl} w-full`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="col-span-2"><label className={luxLabel}>Bank Details</label><input className={`${adminControl} w-full`} value={form.bankDetails} onChange={(e) => setForm({ ...form, bankDetails: e.target.value })} placeholder="A/C, IFSC, UPI" /></div>
              <div className="col-span-2"><label className={luxLabel}>Notes</label><textarea rows={2} className={`${adminControl} w-full`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button className={ghostBtn} onClick={() => setEditing(null)}>Cancel</button>
              <button className={primaryBtn} disabled={saving || !form.name} onClick={save}>{saving ? 'Saving…' : 'Save Vendor'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirmDialog.isOpen} title="Delete this vendor?" message={confirmDialog.pending ? `"${confirmDialog.pending.name}" will be removed. Linked expenses keep their amounts but lose the vendor link.` : ''} loading={confirmDialog.loading} onConfirm={handleDelete} onCancel={confirmDialog.cancel} />
    </div>
  )
}
