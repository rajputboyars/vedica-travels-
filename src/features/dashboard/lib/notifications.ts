import type { Registration } from '@/types'

export interface DashboardNotification {
  id: string
  tone: 'info' | 'success' | 'warning' | 'danger'
  message: string
  date: string
}

// Phase 9 — "View Notifications". Rather than a separate Notification
// model + write path that every status change would need to remember to
// populate (more surface area to keep in sync), notifications are derived
// on read from the same Registration data the rest of the dashboard
// already fetches — one source of truth, no duplicate logic, and it can
// never drift out of sync with the booking's actual state.
export function deriveNotifications(registrations: Registration[]): DashboardNotification[] {
  const notifications: DashboardNotification[] = []

  for (const r of registrations) {
    if (r.paymentStatus === 'rejected' && r.paymentReviewedAt) {
      notifications.push({
        id: `${r._id}-rejected`,
        tone: 'danger',
        message: `Payment for "${r.packageTitle}" was rejected${r.paymentReviewNote ? `: ${r.paymentReviewNote}` : '.'}`,
        date: r.paymentReviewedAt,
      })
    }
    if (r.paymentStatus === 'resubmission_requested' && r.paymentReviewedAt) {
      notifications.push({
        id: `${r._id}-resubmit`,
        tone: 'warning',
        message: `Please resubmit your payment screenshot for "${r.packageTitle}"${r.paymentReviewNote ? `: ${r.paymentReviewNote}` : '.'}`,
        date: r.paymentReviewedAt,
      })
    }
    if (r.paymentStatus === 'verified' && r.status === 'confirmed' && r.paymentReviewedAt) {
      notifications.push({
        id: `${r._id}-confirmed`,
        tone: 'success',
        message: `Your booking for "${r.packageTitle}" is confirmed!`,
        date: r.paymentReviewedAt,
      })
    }
    if (r.seatStatus === 'waiting_list' && r.status !== 'cancelled') {
      notifications.push({
        id: `${r._id}-waitlist`,
        tone: 'info',
        message: `You're on the waiting list for "${r.packageTitle}" — we'll email you the moment a seat opens up.`,
        date: r.createdAt,
      })
    }
    if (r.status === 'cancelled' && r.cancellationReason) {
      notifications.push({
        id: `${r._id}-cancelled`,
        tone: 'danger',
        message: `Your booking for "${r.packageTitle}" was cancelled: ${r.cancellationReason}`,
        date: r.updatedAt,
      })
    }
    if (r.status === 'confirmed') {
      const daysLeft = Math.ceil((new Date(r.travelDate).getTime() - Date.now()) / 86400000)
      if (daysLeft > 0 && daysLeft <= 7) {
        notifications.push({
          id: `${r._id}-upcoming`,
          tone: 'info',
          message: `Your trip for "${r.packageTitle}" starts in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
          date: r.travelDate,
        })
      }
    }
  }

  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
