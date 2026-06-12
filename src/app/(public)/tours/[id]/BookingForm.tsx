'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, User } from 'lucide-react'

interface Passenger {
  name: string
  age: string
  gender: string
  idType: string
  idNumber: string
}

const defaultPassenger = (): Passenger => ({
  name: '', age: '', gender: 'male', idType: 'aadhar', idNumber: ''
})

const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
const labelClass = "block text-xs text-gray-600 font-medium mb-1"

export default function BookingForm({ tourId, tourTitle, price }: { tourId: string; tourTitle: string; price?: number }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [contact, setContact] = useState({
    name: '', phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: ''
  })
  const [passengers, setPassengers] = useState<Passenger[]>([defaultPassenger()])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function updatePassenger(index: number, field: keyof Passenger, value: string) {
    setPassengers(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  function addPassenger() {
    setPassengers(prev => [...prev, defaultPassenger()])
  }

  function removePassenger(index: number) {
    if (passengers.length === 1) return
    setPassengers(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          tourTitle,
          ...contact,
          passengers: passengers.map(p => ({ ...p, age: Number(p.age), attendance: 'not_marked' })),
          numPersons: passengers.length,
          totalAmount: price ? price * passengers.length : undefined,
          message,
        }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">🙏</div>
        <p className="text-green-600 font-semibold text-lg">Registration Complete!</p>
        <p className="text-sm text-gray-500 mt-1">We'll contact you shortly to confirm your booking.</p>
        <p className="text-xs text-gray-400 mt-2">{passengers.length} passenger(s) registered</p>
        <button onClick={() => { setStatus('idle'); setStep(1); setPassengers([defaultPassenger()]); setContact({ name: '', phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '' }) }}
          className="mt-3 text-sm text-orange-600 underline">Register another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 1 ? 'bg-orange-600 text-white' : 'bg-green-500 text-white'}`}>1</div>
        <div className="text-xs text-gray-500">Contact Details</div>
        <div className="flex-1 h-px bg-gray-200 mx-1"></div>
        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${step === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
        <div className="text-xs text-gray-500">Passengers</div>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input className={inputClass} value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} required placeholder="Lead contact name" />
          </div>
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input className={inputClass} type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} required placeholder="Mobile number" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="Email (optional)" />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} placeholder="Your address" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Emergency Contact</label>
              <input className={inputClass} value={contact.emergencyContact} onChange={e => setContact({ ...contact, emergencyContact: e.target.value })} placeholder="Name" />
            </div>
            <div>
              <label className={labelClass}>Emergency Phone</label>
              <input className={inputClass} type="tel" value={contact.emergencyPhone} onChange={e => setContact({ ...contact, emergencyPhone: e.target.value })} placeholder="Phone" />
            </div>
          </div>
          <Button type="button" className="w-full mt-2" onClick={() => setStep(2)} disabled={!contact.name || !contact.phone}>
            Next: Add Passengers →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {passengers.map((p, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User size={14} className="text-orange-600" />
                  Passenger {i + 1}
                </div>
                {passengers.length > 1 && (
                  <button type="button" onClick={() => removePassenger(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input className={inputClass} value={p.name} onChange={e => updatePassenger(i, 'name', e.target.value)} required placeholder="Full name" />
                </div>
                <div>
                  <label className={labelClass}>Age *</label>
                  <input className={inputClass} type="number" min="1" max="99" value={p.age} onChange={e => updatePassenger(i, 'age', e.target.value)} required placeholder="Age" />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select className={inputClass} value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>ID Proof Type *</label>
                  <select className={inputClass} value={p.idType} onChange={e => updatePassenger(i, 'idType', e.target.value)}>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>ID Number *</label>
                  <input className={inputClass} value={p.idNumber} onChange={e => updatePassenger(i, 'idNumber', e.target.value)} required placeholder="ID number" />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addPassenger} className="w-full py-2 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
            <Plus size={15} /> Add Another Passenger
          </button>

          {price && (
            <div className="bg-orange-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>₹{price.toLocaleString()} × {passengers.length} person(s)</span>
                <span className="font-bold text-orange-600">₹{(price * passengers.length).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Special Requirements / Message</label>
            <textarea className={inputClass} value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="Any dietary needs, medical conditions, etc." />
          </div>

          {status === 'error' && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
            <Button type="submit" className="flex-2 flex-grow" disabled={status === 'loading' || passengers.some(p => !p.name || !p.age || !p.idNumber)}>
              {status === 'loading' ? 'Registering...' : `🙏 Register ${passengers.length} Passenger(s)`}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
