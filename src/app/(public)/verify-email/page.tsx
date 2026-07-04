'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MailCheck, XCircle, Loader2 } from 'lucide-react'
import AuthShell from '@/components/lux/AuthShell'

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
      <div className="flex flex-col items-center gap-3 text-white/60 py-4">
        <Loader2 size={28} className="animate-spin text-gilt-300" />
        <p className="text-sm">Verifying your email…</p>
      </div>
    )
  }

  if (state === 'ok') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailCheck size={40} className="text-emerald-400" />
        <p className="font-medium text-white">Email verified!</p>
        <Link href="/dashboard" className="text-gilt-300 text-sm font-medium hover:underline">Go to your dashboard</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <XCircle size={40} className="text-rose-400" />
      <p className="font-medium text-white">This verification link is invalid or has expired.</p>
      <Link href="/dashboard" className="text-gilt-300 text-sm font-medium hover:underline">Go to your dashboard</Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <AuthShell icon={MailCheck} title="Email Verification">
      <Suspense fallback={<p className="text-center text-sm text-white/40">Loading…</p>}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthShell>
  )
}
