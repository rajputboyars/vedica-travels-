'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MailCheck, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailStatus() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [state, setState] = useState<'loading' | 'ok' | 'error'>(token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => setState(res.ok ? 'ok' : 'error'))
      .catch(() => setState('error'))
  }, [token])

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 size={28} className="animate-spin text-orange-500" />
        <p className="text-sm">Verifying your email…</p>
      </div>
    )
  }

  if (state === 'ok') {
    return (
      <div className="flex flex-col items-center gap-3">
        <MailCheck size={40} className="text-green-500" />
        <p className="font-medium text-gray-800">Email verified!</p>
        <Link href="/dashboard" className="text-orange-600 text-sm font-medium hover:underline">Go to your dashboard</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <XCircle size={40} className="text-red-400" />
      <p className="font-medium text-gray-800">This verification link is invalid or has expired.</p>
      <Link href="/dashboard" className="text-orange-600 text-sm font-medium hover:underline">Go to your dashboard</Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center">
        <Suspense fallback={<p className="text-sm text-gray-400">Loading…</p>}>
          <VerifyEmailStatus />
        </Suspense>
      </div>
    </div>
  )
}
