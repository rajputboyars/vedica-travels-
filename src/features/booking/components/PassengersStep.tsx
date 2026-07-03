import { Plus, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inputClass, labelClass, defaultPassenger, type PassengerFormValue } from '../types'

interface Props {
  passengers: PassengerFormValue[]
  onChange: (passengers: PassengerFormValue[]) => void
  message: string
  onMessageChange: (message: string) => void
  price?: number
  submitting: boolean
  hasError: boolean
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}

export default function PassengersStep({
  passengers, onChange, message, onMessageChange, price, submitting, hasError, onBack, onSubmit,
}: Props) {
  function update(index: number, field: keyof PassengerFormValue, value: string) {
    onChange(passengers.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }
  function add() {
    onChange([...passengers, defaultPassenger()])
  }
  function remove(index: number) {
    if (passengers.length === 1) return
    onChange(passengers.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {passengers.map((p, i) => (
        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User size={14} className="text-orange-600" />
              Passenger {i + 1}
            </div>
            {passengers.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className={labelClass}>Full Name *</label>
              <input className={inputClass} value={p.name} onChange={(e) => update(i, 'name', e.target.value)} required placeholder="Full name" />
            </div>
            <div>
              <label className={labelClass}>Age *</label>
              <input className={inputClass} type="number" min="1" max="99" value={p.age} onChange={(e) => update(i, 'age', e.target.value)} required placeholder="Age" />
            </div>
            <div>
              <label className={labelClass}>Gender *</label>
              <select className={inputClass} value={p.gender} onChange={(e) => update(i, 'gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>ID Proof Type *</label>
              <select className={inputClass} value={p.idType} onChange={(e) => update(i, 'idType', e.target.value)}>
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>ID Number *</label>
              <input className={inputClass} value={p.idNumber} onChange={(e) => update(i, 'idNumber', e.target.value)} required placeholder="ID number" />
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="w-full py-2 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
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
        <textarea className={inputClass} value={message} onChange={(e) => onMessageChange(e.target.value)} rows={2} placeholder="Any dietary needs, medical conditions, etc." />
      </div>

      {hasError && <p className="text-red-500 text-xs">Something went wrong. Please try again.</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Back</Button>
        <Button type="submit" onClick={onSubmit} className="flex-2 flex-grow" disabled={submitting || passengers.some((p) => !p.name || !p.age || !p.idNumber)}>
          {submitting ? 'Registering...' : 'Continue to Payment →'}
        </Button>
      </div>
    </div>
  )
}
