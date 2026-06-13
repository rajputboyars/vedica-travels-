'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, X, Upload } from 'lucide-react'

interface TourFormProps {
  initialData?: any
  tourId?: string
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
    services: initialData?.services || [] as string[],
    inclusions: initialData?.inclusions || [] as string[],
    pickupPoints: initialData?.pickupPoints || [] as string[],
  })

  const [newService, setNewService] = useState('')
  const [newInclusion, setNewInclusion] = useState('')
  const [newPickup, setNewPickup] = useState('')

  function addItem(field: 'services' | 'inclusions' | 'pickupPoints', value: string, setter: (v: string) => void) {
    if (!value.trim()) return
    setForm(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
    setter('')
  }

  function removeItem(field: 'services' | 'inclusions' | 'pickupPoints', index: number) {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) }))
  }

  function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm(prev => ({ ...prev, qrImage: reader.result as string }))
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

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Tour Title *</label>
            <input className={inputClass} value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Khatu Shyam Ji Yatra" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Route *</label>
            <input className={inputClass} value={form.route} onChange={e => setForm({...form, route: e.target.value})} required placeholder="e.g. Khatu Shyam Ji → Salasar Balaji → Rani Sati Jhunjhunur" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea className={inputClass} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} placeholder="Describe this yatra..." />
          </div>
          <div>
            <label className={labelClass}>Start Date *</label>
            <input className={inputClass} type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
          </div>
          <div>
            <label className={labelClass}>End Date *</label>
            <input className={inputClass} type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
          </div>
          <div>
            <label className={labelClass}>Price (₹) *</label>
            <input className={inputClass} type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="1500" />
          </div>
          <div>
            <label className={labelClass}>Departure Time</label>
            <input className={inputClass} value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})} placeholder="08:30 PM" />
          </div>
          <div>
            <label className={labelClass}>Total Seats</label>
            <input className={inputClass} type="number" value={form.totalSeats} onChange={e => setForm({...form, totalSeats: Number(e.target.value)})} />
          </div>
          <div>
            <label className={labelClass}>Available Seats</label>
            <input className={inputClass} type="number" value={form.availableSeats} onChange={e => setForm({...form, availableSeats: Number(e.target.value)})} />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select className={inputClass} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="spiritual">🛕 Spiritual Yatra</option>
              <option value="leisure">🏔️ Holiday / Leisure Trip</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Image URL</label>
            <input className={inputClass} value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" />
            <label htmlFor="featured" className="text-sm text-gray-700">Featured on homepage</label>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Services</h2>
        <div className="flex gap-2">
          <input className={inputClass} value={newService} onChange={e => setNewService(e.target.value)} placeholder="e.g. AC Bus" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('services', newService, setNewService))} />
          <Button type="button" size="sm" onClick={() => addItem('services', newService, setNewService)}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.services.map((s: string, i: number) => (
            <span key={i} className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2.5 py-1.5 rounded-full">
              {s} <button type="button" onClick={() => removeItem('services', i)}><X size={11} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Inclusions */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Inclusions</h2>
        <div className="flex gap-2">
          <input className={inputClass} value={newInclusion} onChange={e => setNewInclusion(e.target.value)} placeholder="e.g. Breakfast & Lunch" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('inclusions', newInclusion, setNewInclusion))} />
          <Button type="button" size="sm" onClick={() => addItem('inclusions', newInclusion, setNewInclusion)}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.inclusions.map((s: string, i: number) => (
            <span key={i} className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1.5 rounded-full">
              {s} <button type="button" onClick={() => removeItem('inclusions', i)}><X size={11} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Pickup Points */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="font-semibold text-gray-800">Pickup Points</h2>
        <div className="flex gap-2">
          <input className={inputClass} value={newPickup} onChange={e => setNewPickup(e.target.value)} placeholder="e.g. Sector 52, Noida - Metro Pillar 657" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('pickupPoints', newPickup, setNewPickup))} />
          <Button type="button" size="sm" onClick={() => addItem('pickupPoints', newPickup, setNewPickup)}><Plus size={14} /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.pickupPoints.map((s: string, i: number) => (
            <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1.5 rounded-full">
              {s} <button type="button" onClick={() => removeItem('pickupPoints', i)}><X size={11} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Payment (QR Code)</h2>
        <div>
          <label className={labelClass}>Upload Payment QR Code</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 text-sm font-medium hover:bg-orange-50 cursor-pointer">
              <Upload size={15} /> {form.qrImage ? 'Change QR' : 'Choose QR image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleQrFile} />
            </label>
            {form.qrImage && (
              <div className="flex items-center gap-2">
                <img src={form.qrImage} alt="QR" className="w-16 h-16 object-contain border border-gray-200 rounded-lg bg-white" />
                <button type="button" onClick={() => setForm({ ...form, qrImage: '' })} className="text-xs text-red-500 underline">Remove</button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">This QR is shown to users on the payment step.</p>
        </div>
        <div>
          <label className={labelClass}>Payment Instructions / Note</label>
          <textarea className={inputClass} value={form.paymentNote} onChange={e => setForm({ ...form, paymentNote: e.target.value })} rows={2}
            placeholder="e.g. Please call once before payment, then send the screenshot to confirm." />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : tourId ? 'Update Tour' : 'Create Tour'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
