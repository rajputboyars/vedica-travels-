'use client'
import { useState } from 'react'

// Every admin list page (tours, bookings, gallery) needs the same
// "pending item to delete + loading state + confirm/cancel" trio wired to
// <ConfirmDialog>. This hook owns that state so pages just call
// `confirm.ask(item)` and provide an onConfirm callback.
export function useConfirmDialog<T>() {
  const [pending, setPending] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)

  function ask(item: T) {
    setPending(item)
  }
  function cancel() {
    setPending(null)
  }
  async function confirm(action: (item: T) => Promise<void>) {
    if (!pending) return
    setLoading(true)
    try {
      await action(pending)
    } finally {
      setLoading(false)
      setPending(null)
    }
  }

  return { pending, loading, ask, cancel, confirm, isOpen: !!pending }
}
