'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Panel, adminControl, luxLabel, primaryBtn, ghostBtn } from '@/features/admin/components/ui'
import type { Package, PackageItineraryDay, PackageFAQ } from '@/types'
import { packageCategoryOrder, packageCategoryMeta } from '@/config/package-theme'

interface PackageFormProps {
  initialData?: Package
  packageId?: string
}

// Generic "chip list" editor shared by services/pickup-points/etc — same
// add/remove-by-index pattern as features/tours/components/TourForm.tsx,
// just parameterized so this one form doesn't repeat it five times.
function ChipListEditor({
  items, onAdd, onRemove, placeholder, chipClass,
}: {
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  placeholder: string
  chipClass: string
}) {
  const [value, setValue] = useState('')
  function submit() {
    if (!value.trim()) return
    onAdd(value.trim())
    setValue('')
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className={`${adminControl} flex-1`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
        />
        <button type="button" className={ghostBtn} onClick={submit}><Plus size={14} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s, i) => (
          <span key={i} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full ${chipClass}`}>
            {s} <button type="button" onClick={() => onRemove(i)}><X size={11} /></button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function PackageForm({ initialData, packageId }: PackageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || 'spiritual',
    status: initialData?.status || 'draft',
    price: initialData?.price ?? '',
    days: initialData?.duration?.days ?? 1,
    nights: initialData?.duration?.nights ?? 0,
    totalSeats: initialData?.totalSeats ?? 50,
    featured: initialData?.featured || false,
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    images: initialData?.images || ([] as string[]),
    gallery: initialData?.gallery || ([] as string[]),
    pickupPoints: initialData?.pickupPoints || ([] as string[]),
    includedServices: initialData?.includedServices || ([] as string[]),
    excludedServices: initialData?.excludedServices || ([] as string[]),
    itinerary: initialData?.itinerary || ([] as PackageItineraryDay[]),
    faqs: initialData?.faqs || ([] as PackageFAQ[]),
    paymentNote: initialData?.paymentNote || '',
    qrImages: initialData?.qrImages || ([] as string[]),
  })

  const [newItinerary, setNewItinerary] = useState({ title: '', description: '' })
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  function chip(field: 'images' | 'gallery' | 'pickupPoints' | 'includedServices' | 'excludedServices' | 'qrImages') {
    return {
      items: form[field],
      onAdd: (value: string) => setForm((prev) => ({ ...prev, [field]: [...prev[field], value] })),
      onRemove: (index: number) => setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) })),
    }
  }

  function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((prev) => ({ ...prev, qrImages: [...prev.qrImages, reader.result as string] }))
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function addItineraryDay() {
    if (!newItinerary.title.trim()) return
    setForm((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: newItinerary.title.trim(), description: newItinerary.description.trim() }],
    }))
    setNewItinerary({ title: '', description: '' })
  }
  function removeItineraryDay(index: number) {
    setForm((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })),
    }))
  }

  function addFaq() {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return
    setForm((prev) => ({ ...prev, faqs: [...prev.faqs, { question: newFaq.question.trim(), answer: newFaq.answer.trim() }] }))
    setNewFaq({ question: '', answer: '' })
  }
  function removeFaq(index: number) {
    setForm((prev) => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = packageId ? `/api/packages/${packageId}` : '/api/packages'
      const method = packageId ? 'PUT' : 'POST'
      const payload = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        category: form.category,
        status: form.status,
        price: Number(form.price) || 0,
        duration: { days: Number(form.days) || 1, nights: Number(form.nights) || 0 },
        totalSeats: Number(form.totalSeats) || 0,
        featured: form.featured,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        images: form.images,
        gallery: form.gallery,
        pickupPoints: form.pickupPoints,
        includedServices: form.includedServices,
        excludedServices: form.excludedServices,
        itinerary: form.itinerary,
        faqs: form.faqs,
        paymentNote: form.paymentNote || undefined,
        qrImages: form.qrImages,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/admin/packages')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to save package')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm rounded-xl px-4 py-3">{error}</div>}

      <Panel title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={luxLabel}>Package Title *</label>
            <input className={`${adminControl} w-full`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Char Dham Yatra" />
          </div>
          <div className="md:col-span-2">
            <label className={luxLabel}>Short Description</label>
            <input className={`${adminControl} w-full`} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="One-line hook shown on listing cards" />
          </div>
          <div className="md:col-span-2">
            <label className={luxLabel}>Description *</label>
            <textarea className={`${adminControl} w-full`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describe this package..." />
          </div>
          <div>
            <label className={luxLabel}>Category *</label>
            <select className={`${adminControl} w-full`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Package['category'] })}>
              {packageCategoryOrder.map((c) => (
                <option key={c} value={c}>{packageCategoryMeta[c].emoji} {packageCategoryMeta[c].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={luxLabel}>Status</label>
            <select className={`${adminControl} w-full`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Package['status'] })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className={luxLabel}>Price (₹) *</label>
            <input className={`${adminControl} w-full`} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="18500" />
          </div>
          <div>
            <label className={luxLabel}>Total Seats</label>
            <input className={`${adminControl} w-full`} type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} />
          </div>
          <div>
            <label className={luxLabel}>Duration — Days *</label>
            <input className={`${adminControl} w-full`} type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} required />
          </div>
          <div>
            <label className={luxLabel}>Duration — Nights</label>
            <input className={`${adminControl} w-full`} type="number" min={0} value={form.nights} onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-gilt-500" /> Featured on homepage
          </label>
        </div>
      </Panel>

      <Panel title="Images (cover / listing)">
        <ChipListEditor {...chip('images')} placeholder="Image URL" chipClass="bg-gilt-400/15 text-gilt-300" />
      </Panel>

      <Panel title="Gallery (extra photos)">
        <ChipListEditor {...chip('gallery')} placeholder="Image URL" chipClass="bg-violet-500/15 text-violet-300" />
      </Panel>

      <Panel title="Itinerary">
        <div className="space-y-4">
          <div className="space-y-2">
            {form.itinerary.map((day, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <span className="text-xs font-semibold text-gilt-300 mt-0.5 shrink-0">Day {day.day}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{day.title}</div>
                  {day.description && <div className="text-xs text-white/50">{day.description}</div>}
                </div>
                <button type="button" onClick={() => removeItineraryDay(i)} className="text-white/40 hover:text-rose-300 shrink-0"><X size={14} /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className={adminControl} value={newItinerary.title} onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })} placeholder="Day title, e.g. Arrival & Darshan" />
            <input className={adminControl} value={newItinerary.description} onChange={(e) => setNewItinerary({ ...newItinerary, description: e.target.value })} placeholder="Day description" />
          </div>
          <button type="button" className={ghostBtn} onClick={addItineraryDay}><Plus size={14} /> Add Day {form.itinerary.length + 1}</button>
        </div>
      </Panel>

      <Panel title="Pickup Points">
        <ChipListEditor {...chip('pickupPoints')} placeholder="e.g. Sector 52, Noida - Metro Pillar 657" chipClass="bg-sky-500/15 text-sky-300" />
      </Panel>

      <Panel title="Included Services">
        <ChipListEditor {...chip('includedServices')} placeholder="e.g. AC Bus, Breakfast" chipClass="bg-emerald-500/15 text-emerald-300" />
      </Panel>

      <Panel title="Excluded Services">
        <ChipListEditor {...chip('excludedServices')} placeholder="e.g. Lunch, Personal expenses" chipClass="bg-rose-500/15 text-rose-300" />
      </Panel>

      <Panel title="FAQs">
        <div className="space-y-4">
          <div className="space-y-2">
            {form.faqs.map((f, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">Q: {f.question}</div>
                  <div className="text-xs text-white/50">A: {f.answer}</div>
                </div>
                <button type="button" onClick={() => removeFaq(i)} className="text-white/40 hover:text-rose-300 shrink-0"><X size={14} /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2">
            <input className={adminControl} value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} placeholder="Question" />
            <input className={adminControl} value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} placeholder="Answer" />
          </div>
          <button type="button" className={ghostBtn} onClick={addFaq}><Plus size={14} /> Add FAQ</button>
        </div>
      </Panel>

      <Panel title="Payment (QR Codes)">
        <div className="space-y-4">
          <div>
            <label className={luxLabel}>Upload Payment QR Code(s)</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gilt-500/30 text-gilt-300 text-sm font-medium hover:bg-gilt-500/5 cursor-pointer transition-colors">
                Add QR image
                <input type="file" accept="image/*" className="hidden" onChange={handleQrFile} />
              </label>
              {form.qrImages.map((qr, i) => (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local file preview via FileReader, same pattern as TourForm's QR upload */}
                  <img src={qr} alt={`QR ${i + 1}`} className="w-16 h-16 object-contain border border-white/10 rounded-lg bg-white" />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, qrImages: prev.qrImages.filter((_, idx) => idx !== i) }))}
                    className="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 bg-ink-900 border border-white/10 rounded-full text-rose-300"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-1.5">Admins can attach one or multiple QR codes — customers see all of them on the payment step.</p>
          </div>
          <div>
            <label className={luxLabel}>Payment Instructions / Note</label>
            <textarea className={`${adminControl} w-full`} value={form.paymentNote} onChange={(e) => setForm({ ...form, paymentNote: e.target.value })} rows={2}
              placeholder="e.g. Scan the QR, pay the total amount, then submit your transaction ID and screenshot." />
          </div>
        </div>
      </Panel>

      <Panel title="SEO">
        <div className="space-y-4">
          <div>
            <label className={luxLabel}>Meta Title</label>
            <input className={`${adminControl} w-full`} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Shown as the browser tab / search result title" />
          </div>
          <div>
            <label className={luxLabel}>Meta Description</label>
            <textarea className={`${adminControl} w-full`} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} placeholder="Shown as the search result snippet" />
          </div>
        </div>
      </Panel>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? 'Saving...' : packageId ? 'Update Package' : 'Create Package'}
        </button>
        <button type="button" className={ghostBtn} onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  )
}
