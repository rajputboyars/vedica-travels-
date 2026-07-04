'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import AuthShell, { SubmitButton } from '@/components/lux/AuthShell'
import Field, { Input } from '@/components/lux/Field'
import { siteConfig } from '@/config/site'

export default function CustomerRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create account')
      setDone(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      icon={UserPlus}
      title="Create Your Account"
      subtitle={`Join ${siteConfig.name} to track your bookings`}
      footer={done ? undefined : <>Already have an account? <Link href="/login" className="text-gilt-300 font-medium hover:underline">Log in</Link></>}
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 size={40} className="text-emerald-400" />
          <p className="text-sm text-white/70">Account created! We&apos;ve sent a verification email — redirecting you to your dashboard…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Name" htmlFor="name">
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" htmlFor="password" error={error} hint={<span className="text-xs text-white/40">Min 8 characters</span>}>
            <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <SubmitButton type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</SubmitButton>
        </form>
      )}
    </AuthShell>
  )
}
