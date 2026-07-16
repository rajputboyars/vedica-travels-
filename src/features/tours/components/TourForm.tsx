'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Upload } from 'lucide-react'
import { Panel, adminControl, luxLabel, primaryBtn, ghostBtn } from '@/features/admin/components/ui'
import type { Tour } from '@/types'

interface TourFormProps {
  initialData?: Tour
  tourId?: string
}

const tagClass: Record<string, string> = {
  services: 'bg-gilt-400/15 text-gilt-300',
  inclusions: 'bg-emerald-500/15 text-emerald-300',
  pickupPoints: 'bg-sky-500/15 text-sky-300',
}

// Hoisted outside TourForm (not defined during render) — a component
// declared inside another component's body gets recreated every render,
// which remounts it and drops any of its own state.
function TagList({ field, items, onRemove }: { field: keyof typeof tagClass; items: string[]; onRemove: (index: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s, i) => (
        <span key={i} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full ${tagClass[field]}`}>
          {s} <button type="button" onClick={() => onRemove(i)}><X size={11} /></button>
        </span>
      ))}
    </div>
  )
}

export default function TourForm({ initialData, tourId }: TourFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    route: initialData?.route || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    price: initialData?.price || '',
    departureTime: initialData?.departureTime || '08:30 PM',
    totalSeats: initialData?.totalSeats || 50,
    availableSeats: initialData?.availableSeats || 50,
    status: initialData?.status || 'upcoming',
    category: initialData?.category || 'spiritual',
    featured: initialData?.featured || false,
    image: initialData?.image || '',
    qrImage: initialData?.qrImage || '',
    paymentNote: initialData?.paymentNote || '',
    services: initialData?.services || ([] as string[]),
    inclusions: initialData?.inclusions || ([] as string[]),
    pickupPoints: initialData?.pickupPoints || ([] as string[]),
  })

  const [newService, setNewService] = useState('')
  const [newInclusion, setNewInclusion] = useState('')
  const [newPickup, setNewPickup] = useState('')

  function addItem(field: 'services' | 'inclusions' | 'pickupPoints', value: string, setter: (v: string) => void) {
    if (!value.trim()) return
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }))
    setter('')
  }

  function removeItem(field: 'services' | 'inclusions' | 'pickupPoints', index: number) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((prev) => ({ ...prev, qrImage: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = tourId ? `/api/tours/${tourId}` : '/api/tours'
      const method = tourId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/admin/tours')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Panel title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={luxLabel}>Tour Title *</label>
            <input className={`${adminControl} w-full`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Khatu Shyam Ji Yatra" />
          </div>
          <div className="md:col-span-2">
            <label className={luxLabel}>Route *</label>
            <input className={`${adminControl} w-full`} value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} required placeholder="e.g. Khatu Shyam Ji → Salasar Balaji → Rani Sati Jhunjhunur" />
          </div>
          <div className="md:col-span-2">
            <label className={luxLabel}>Description *</label>
            <textarea className={`${adminControl} w-full`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describe this yatra..." />
          </div>
          <div>
            <label className={luxLabel}>Start Date *</label>
            <input className={`${adminControl} w-full`} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          </div>
          <div>
            <label className={luxLabel}>End Date *</label>
            <input className={`${adminControl} w-full`} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <div>
            <label className={luxLabel}>Price (₹) *</label>
            <input className={`${adminControl} w-full`} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="1500" />
          </div>
          <div>
            <label className={luxLabel}>Departure Time</label>
            <input className={`${adminControl} w-full`} value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} placeholder="08:30 PM" />
          </div>
          <div>
            <label className={luxLabel}>Total Seats</label>
            <input className={`${adminControl} w-full`} type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} />
          </div>
          <div>
            <label className={luxLabel}>Available Seats</label>
            <input className={`${adminControl} w-full`} type="number" value={form.availableSeats} onChange={(e) => setForm({ ...form, availableSeats: Number(e.target.value) })} />
          </div>
          <div>
            <label className={luxLabel}>Status</label>
            <select className={`${adminControl} w-full`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Tour['status'] })}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className={luxLabel}>Category *</label>
            <select className={`${adminControl} w-full`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Tour['category'] })}>
              <option value="spiritual">🛕 Spiritual Yatra</option>
              <option value="leisure">🏔️ Holiday / Leisure Trip</option>
            </select>
          </div>
          <div>
            <label className={luxLabel}>Image URL</label>
            <input className={`${adminControl} w-full`} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-gilt-500" /> Featured on homepage
          </label>
        </div>
      </Panel>

      <Panel title="Services">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input className={`${adminControl} flex-1`} value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="e.g. AC Bus" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('services', newService, setNewService))} />
            <button type="button" className={ghostBtn} onClick={() => addItem('services', newService, setNewService)}><Plus size={14} /></button>
          </div>
          <TagList field="services" items={form.services} onRemove={(i) => removeItem('services', i)} />
        </div>
      </Panel>

      <Panel title="Inclusions">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input className={`${adminControl} flex-1`} value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} placeholder="e.g. Breakfast & Lunch" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('inclusions', newInclusion, setNewInclusion))} />
            <button type="button" className={ghostBtn} onClick={() => addItem('inclusions', newInclusion, setNewInclusion)}><Plus size={14} /></button>
          </div>
          <TagList field="inclusions" items={form.inclusions} onRemove={(i) => removeItem('inclusions', i)} />
        </div>
      </Panel>

      <Panel title="Pickup Points">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input className={`${adminControl} flex-1`} value={newPickup} onChange={(e) => setNewPickup(e.target.value)} placeholder="e.g. Sector 52, Noida - Metro Pillar 657" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('pickupPoints', newPickup, setNewPickup))} />
            <button type="button" className={ghostBtn} onClick={() => addItem('pickupPoints', newPickup, setNewPickup)}><Plus size={14} /></button>
          </div>
          <TagList field="pickupPoints" items={form.pickupPoints} onRemove={(i) => removeItem('pickupPoints', i)} />
        </div>
      </Panel>

      <Panel title="Payment (QR Code)">
        <div className="space-y-4">
          <div>
            <label className={luxLabel}>Upload Payment QR Code</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gilt-500/30 text-gilt-300 text-sm font-medium hover:bg-gilt-500/5 cursor-pointer transition-colors">
                <Upload size={15} /> {form.qrImage ? 'Change QR' : 'Choose QR image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleQrFile} />
              </label>
              {form.qrImage && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local file preview via FileReader, not an optimizable remote image */}
                  <img src={form.qrImage} alt="QR" className="w-16 h-16 object-contain border border-white/10 rounded-lg bg-white" />
                  <button type="button" onClick={() => setForm({ ...form, qrImage: '' })} className="text-xs text-rose-300 underline">Remove</button>
                </div>
              )}
            </div>
            <p className="text-xs text-white/40 mt-1.5">This QR is shown to users on the payment step.</p>
          </div>
          <div>
            <label className={luxLabel}>Payment Instructions / Note</label>
            <textarea className={`${adminControl} w-full`} value={form.paymentNote} onChange={(e) => setForm({ ...form, paymentNote: e.target.value })} rows={2}
              placeholder="e.g. Please call once before payment, then send the screenshot to confirm." />
          </div>
        </div>
      </Panel>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? 'Saving...' : tourId ? 'Update Tour' : 'Create Tour'}
        </button>
        <button type="button" className={ghostBtn} onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
