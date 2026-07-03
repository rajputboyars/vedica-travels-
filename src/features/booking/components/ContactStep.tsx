import { Button } from '@/components/ui/button'
import { inputClass, labelClass, type ContactFormValue } from '../types'

interface Props {
  contact: ContactFormValue
  onChange: (contact: ContactFormValue) => void
  onNext: () => void
}

export default function ContactStep({ contact, onChange, onNext }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input className={inputClass} value={contact.name} onChange={(e) => onChange({ ...contact, name: e.target.value })} required placeholder="Lead contact name" />
      </div>
      <div>
        <label className={labelClass}>Phone Number *</label>
        <input className={inputClass} type="tel" value={contact.phone} onChange={(e) => onChange({ ...contact, phone: e.target.value })} required placeholder="Mobile number" />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input className={inputClass} type="email" value={contact.email} onChange={(e) => onChange({ ...contact, email: e.target.value })} placeholder="Email (optional)" />
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <input className={inputClass} value={contact.address} onChange={(e) => onChange({ ...contact, address: e.target.value })} placeholder="Your address" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Emergency Contact</label>
          <input className={inputClass} value={contact.emergencyContact} onChange={(e) => onChange({ ...contact, emergencyContact: e.target.value })} placeholder="Name" />
        </div>
        <div>
          <label className={labelClass}>Emergency Phone</label>
          <input className={inputClass} type="tel" value={contact.emergencyPhone} onChange={(e) => onChange({ ...contact, emergencyPhone: e.target.value })} placeholder="Phone" />
        </div>
      </div>
      <Button type="button" className="w-full mt-2" onClick={onNext} disabled={!contact.name || !contact.phone}>
        Next: Add Passengers →
      </Button>
    </div>
  )
}
