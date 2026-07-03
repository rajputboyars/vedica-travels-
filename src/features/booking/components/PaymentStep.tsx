import { useState } from 'react'
import { Phone, Upload, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { inputClass, labelClass } from '../types'
import { siteConfig, phoneHref } from '@/config/site'

interface Props {
  bookingRef: string
  totalAmount: number
  qrImage?: string
  paymentNote?: string
  onSubmitPayment: (data: { screenshot: string; payRef: string }) => Promise<void>
  onSkip: () => void
}

export default function PaymentStep({ bookingRef, totalAmount, qrImage, paymentNote, onSubmitPayment, onSkip }: Props) {
  const [screenshot, setScreenshot] = useState('')
  const [payRef, setPayRef] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setScreenshot(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function submit() {
    setSubmitting(true)
    try {
      await onSubmitPayment({ screenshot, payRef })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <CheckCircle2 size={36} className="mx-auto text-green-500 mb-1" />
        <p className="font-semibold text-gray-800">Almost done — complete payment</p>
        <p className="text-xs text-gray-500">Booking Ref: <span className="font-mono font-semibold">{bookingRef}</span></p>
      </div>

      {totalAmount > 0 && (
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500">Amount to pay</div>
          <div className="text-2xl font-bold text-orange-600">₹{totalAmount.toLocaleString()}</div>
        </div>
      )}

      <div className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50">
        {qrImage ? (
          <img src={qrImage} alt="Payment QR" className="w-44 h-44 mx-auto object-contain bg-white rounded-lg p-2" />
        ) : (
          <div className="w-44 h-44 mx-auto flex items-center justify-center bg-white rounded-lg text-xs text-gray-400 text-center px-4">
            QR code not set yet. Please call us for payment details.
          </div>
        )}
        <p className="text-xs text-gray-600 mt-3 font-medium">Scan & pay via any UPI app</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        ⚠️ {paymentNote || 'Please call once before payment, then send the payment screenshot here to confirm.'}
      </div>

      <a href={phoneHref(siteConfig.contact.primaryPhone)} className="flex items-center justify-center gap-2 w-full py-2.5 border border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors">
        <Phone size={15} /> Call before payment: {siteConfig.contact.primaryPhone}
      </a>

      <div>
        <label className={labelClass}>Upload Payment Screenshot</label>
        <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 text-sm font-medium hover:bg-orange-50 cursor-pointer">
          <Upload size={15} /> {screenshot ? 'Change screenshot' : 'Choose screenshot'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        {screenshot && <img src={screenshot} alt="Payment proof" className="mt-2 max-h-40 mx-auto rounded-lg border border-gray-200" />}
      </div>

      <div>
        <label className={labelClass}>UPI / Transaction Reference (optional)</label>
        <input className={inputClass} value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="e.g. UPI ref / UTR number" />
      </div>

      <Button type="button" className="w-full" onClick={submit} disabled={submitting || !screenshot}>
        {submitting ? 'Submitting...' : 'Submit Payment Proof'}
      </Button>
      <button type="button" onClick={onSkip} className="w-full text-xs text-gray-400 underline">
        I&apos;ll send the screenshot later on WhatsApp
      </button>
    </div>
  )
}
