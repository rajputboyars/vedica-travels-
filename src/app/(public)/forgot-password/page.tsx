'use client'
import { useState } from 'react'
import Link from 'next/link'
import { KeyRound, MailCheck } from 'lucide-react'
import AuthShell, { SubmitButton } from '@/components/lux/AuthShell'
import Field, { Input } from '@/components/lux/Field'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      // Always show the generic message the API returns — see
      // requestPasswordReset's doc comment on why (no account enumeration).
      setMessage(data.message || 'If an account exists for that email, a reset link has been sent.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      icon={KeyRound}
      title="Reset Password"
      subtitle="We'll email you a reset link"
      footer={<Link href="/login" className="text-gilt-300 font-medium hover:underline">Back to login</Link>}
    >
      {message ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <MailCheck size={40} className="text-emerald-400" />
          <p className="text-sm text-white/70">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <SubmitButton type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Reset Link'}</SubmitButton>
        </form>
      )}
    </AuthShell>
  )
}
