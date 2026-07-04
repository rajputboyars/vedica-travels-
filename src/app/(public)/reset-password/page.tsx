'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import AuthShell, { SubmitButton } from '@/components/lux/AuthShell'
import Field, { Input } from '@/components/lux/Field'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not reset password')
      setDone(true)
      setTimeout(() => router.push('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <p className="text-center text-sm text-rose-400 py-4">
        This reset link is missing its token. Please request a new one from{' '}
        <Link href="/forgot-password" className="underline">here</Link>.
      </p>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 size={40} className="text-emerald-400" />
        <p className="text-sm text-white/70">Password reset — redirecting you to login…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="New Password" htmlFor="password" error={error} hint={<span className="text-xs text-white/40">Min 8 characters</span>}>
        <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>
      <SubmitButton type="submit" disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</SubmitButton>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthShell icon={KeyRound} title="Set a New Password">
      <Suspense fallback={<p className="text-center text-sm text-white/40">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
