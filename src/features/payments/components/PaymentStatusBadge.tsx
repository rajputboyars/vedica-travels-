import type { PaymentStatus } from '@/types'

const styles: Record<PaymentStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  screenshot_received: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const labels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  screenshot_received: 'To Verify',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
}

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || 'Pending'}
    </span>
  )
}
