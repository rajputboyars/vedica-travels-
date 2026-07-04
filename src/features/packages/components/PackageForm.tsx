'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import type { Package, PackageItineraryDay, PackageFAQ } from '@/types'
import { packageCategoryOrder, packageCategoryMeta } from '@/config/package-theme'

interface PackageFormProps {
  initialData?: Package
  packageId?: string
}

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

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
          className={inputClass}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
        />
        <Button type="button" size="sm" onClick={submit}><Plus size={14} /></Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((s, i) => (
          <span key={i} className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full ${chipClass}`}>
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
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Package Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Char Dham Yatra" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Short Description</label>
            <input className={inputClass} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="One-line hook shown on listing cards" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describe this package..." />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Package['category'] })}>
              {packageCategoryOrder.map((c) => (
                <option key={c} value={c}>{packageCategoryMeta[c].emoji} {packageCategoryMeta[c].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Package['status'] })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input className={inputClass} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="18500" />
          </div>
          <div>
            <label className={labelClass}>Total Seats</label>
            <input className={inputClass} type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: Number(e.target.value) })} />
          </div>
          <div>
            <label className={labelClass}>Duration — Days *</label>
            <input className={inputClass} type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} required />
          </div>
          <div>
            <label className={labelClass}>Duration — Nights</label>
            <input className={inputClass} type="number" min={0} value={form.nights} onChange={(e) => setForm({ ...form, nights: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
            <label htmlFor="featured" className="text-sm text-gray-700">Featured on homepage</label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Images (cover / listing)</h2>
        <ChipListEditor {...chip('images')} placeholder="Image URL" chipClass="bg-orange-100 text-orange-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Gallery (extra photos)</h2>
        <ChipListEditor {...chip('gallery')} placeholder="Image URL" chipClass="bg-purple-100 text-purple-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Itinerary</h2>
        <div className="space-y-2">
          {form.itinerary.map((day, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <span className="text-xs font-semibold text-orange-600 mt-0.5 shrink-0">Day {day.day}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{day.title}</div>
                {day.description && <div className="text-xs text-gray-500">{day.description}</div>}
              </div>
              <button type="button" onClick={() => removeItineraryDay(i)} className="text-gray-400 hover:text-red-500 shrink-0"><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className={inputClass} value={newItinerary.title} onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })} placeholder="Day title, e.g. Arrival & Darshan" />
          <input className={inputClass} value={newItinerary.description} onChange={(e) => setNewItinerary({ ...newItinerary, description: e.target.value })} placeholder="Day description" />
        </div>
        <Button type="button" size="sm" onClick={addItineraryDay}><Plus size={14} className="mr-1" /> Add Day {form.itinerary.length + 1}</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Pickup Points</h2>
        <ChipListEditor {...chip('pickupPoints')} placeholder="e.g. Sector 52, Noida - Metro Pillar 657" chipClass="bg-blue-100 text-blue-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Included Services</h2>
        <ChipListEditor {...chip('includedServices')} placeholder="e.g. AC Bus, Breakfast" chipClass="bg-green-100 text-green-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Excluded Services</h2>
        <ChipListEditor {...chip('excludedServices')} placeholder="e.g. Lunch, Personal expenses" chipClass="bg-red-100 text-red-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">FAQs</h2>
        <div className="space-y-2">
          {form.faqs.map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">Q: {f.question}</div>
                <div className="text-xs text-gray-500">A: {f.answer}</div>
              </div>
              <button type="button" onClick={() => removeFaq(i)} className="text-gray-400 hover:text-red-500 shrink-0"><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <input className={inputClass} value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} placeholder="Question" />
          <input className={inputClass} value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} placeholder="Answer" />
        </div>
        <Button type="button" size="sm" onClick={addFaq}><Plus size={14} className="mr-1" /> Add FAQ</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Payment (QR Codes) — Phase 5</h2>
        <div>
          <label className={labelClass}>Upload Payment QR Code(s)</label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 text-sm font-medium hover:bg-orange-50 cursor-pointer">
              Add QR image
              <input type="file" accept="image/*" className="hidden" onChange={handleQrFile} />
            </label>
            {form.qrImages.map((qr, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- local file preview via FileReader, same pattern as TourForm's QR upload */}
                <img src={qr} alt={`QR ${i + 1}`} className="w-16 h-16 object-contain border border-gray-200 rounded-lg bg-white" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, qrImages: prev.qrImages.filter((_, idx) => idx !== i) }))}
                  className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Admins can attach one or multiple QR codes — customers see all of them on the payment step.</p>
        </div>
        <div>
          <label className={labelClass}>Payment Instructions / Note</label>
          <textarea className={inputClass} value={form.paymentNote} onChange={(e) => setForm({ ...form, paymentNote: e.target.value })} rows={2}
            placeholder="e.g. Scan the QR, pay the total amount, then submit your transaction ID and screenshot." />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">SEO</h2>
        <div>
          <label className={labelClass}>Meta Title</label>
          <input className={inputClass} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="Shown as the browser tab / search result title" />
        </div>
        <div>
          <label className={labelClass}>Meta Description</label>
          <textarea className={inputClass} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} placeholder="Shown as the search result snippet" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : packageId ? 'Update Package' : 'Create Package'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
