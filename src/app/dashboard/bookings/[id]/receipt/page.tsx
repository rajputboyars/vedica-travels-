'use client'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/hooks/use-fetch'
import { bookingStatusMeta, paymentStatusMeta } from '@/config/registration-status'
import { siteConfig } from '@/config/site'
import { idTypeLabels } from '@/types'
import type { Registration } from '@/types'

interface PageProps { params: Promise<{ id: string }> }

// Phase 9 — "Download Booking Receipt". Rather than pulling in a
// PDF-generation dependency, this is a print-friendly page: the browser's
// native "Print > Save as PDF" (window.print()) produces the PDF with zero
// extra libraries — consistent with this codebase's established
// preference (see the hand-rolled SVG charts in Phase 8) for avoiding
// npm dependencies where a built-in browser capability already covers it.
export default function BookingReceiptPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: registration, loading } = useFetch<Registration | null>(`/api/registrations/${id}`, null)

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>
  if (!registration) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-400">
        Booking not found.{' '}
        <Link href="/dashboard/bookings" className="text-orange-600 hover:underline">Back to My Bookings</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/dashboard/bookings/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={15} /> Back
        </Link>
        <Button onClick={() => window.print()}>
          <Printer size={15} className="mr-1" /> Print / Save as PDF
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <div>
            <div className="font-bold text-lg text-gray-800">{siteConfig.name}</div>
            <div className="text-xs text-gray-400">{siteConfig.address.line1}, {siteConfig.address.line2}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Booking Receipt</div>
            <div className="font-mono font-semibold text-gray-700">{registration.bookingId}</div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-1">{registration.packageTitle}</h2>
        <div className="text-sm text-gray-500 mb-6">
          {bookingStatusMeta[registration.status].label} · {paymentStatusMeta[registration.paymentStatus].label}
        </div>

        <table className="w-full text-sm">
          <tbody>
            {[
              ['Traveller Name', registration.name],
              ['Age / Gender', `${registration.age} / ${registration.gender}`],
              ['Mobile', registration.mobile],
              ['Email', registration.email],
              ['ID Proof', `${idTypeLabels[registration.idType]}: ${registration.idNumber}`],
              ['Address', `${registration.address}, ${registration.city}, ${registration.state}`],
              ['Emergency Contact', `${registration.emergencyContactName} (${registration.emergencyContactPhone})`],
              ['Travel Date', new Date(registration.travelDate).toLocaleDateString('en-IN')],
              ['Number of Persons', String(registration.numPersons)],
              ...(registration.paymentAmount != null ? [['Amount Paid', `₹${registration.paymentAmount.toLocaleString()}`]] : []),
              ...(registration.transactionId ? [['Transaction ID', registration.transactionId]] : []),
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100 last:border-0">
                <td className="py-2 text-gray-400 w-1/3">{label}</td>
                <td className="py-2 text-gray-800 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
          This is a system-generated receipt from {siteConfig.name}. For queries, contact {siteConfig.contact.primaryPhone}.
        </p>
      </div>
    </div>
  )
}
