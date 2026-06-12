'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function BookingForm({ tourId, tourTitle }: { tourId: string, tourTitle: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', numPersons: 1, message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tourId, tourTitle }),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', phone: '', email: '', numPersons: 1, message: '' })
      } else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-2">🙏</div>
        <p className="text-green-600 font-semibold">Booking request received!</p>
        <p className="text-sm text-gray-500 mt-1">We&apos;ll contact you shortly to confirm.</p>
        <button onClick={() => setStatus('idle')} className="mt-3 text-sm text-orange-600 underline">Book another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-gray-600 font-medium">Full Name *</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          required placeholder="Your name"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 font-medium">Phone *</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
          required placeholder="Mobile number" type="tel"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 font-medium">Email</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          placeholder="Email (optional)" type="email"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 font-medium">Number of Persons *</label>
        <input
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          value={form.numPersons} onChange={e => setForm({...form, numPersons: Number(e.target.value)})}
          required min={1} max={20} type="number"
        />
      </div>
      <div>
        <label className="text-xs text-gray-600 font-medium">Message</label>
        <textarea
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          value={form.message} onChange={e => setForm({...form, message: e.target.value})}
          rows={2} placeholder="Any special requirements?"
        />
      </div>
      {status === 'error' && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}
      <Button type="submit" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Submitting...' : '🙏 Book Now'}
      </Button>
    </form>
  )
}
