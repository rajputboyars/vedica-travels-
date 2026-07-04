'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn } from 'lucide-react'
import AuthShell, { SubmitButton } from '@/components/lux/AuthShell'
import Field, { Input } from '@/components/lux/Field'
import { siteConfig } from '@/config/site'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid email or password')
      router.push(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        error={error}
        hint={<Link href="/forgot-password" className="text-xs text-gilt-300 hover:underline">Forgot password?</Link>}
      >
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Field>
      <SubmitButton type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</SubmitButton>
    </form>
  )
}

export default function CustomerLoginPage() {
  return (
    <AuthShell
      icon={LogIn}
      title="Welcome Back"
      subtitle={`Log in to ${siteConfig.name}`}
      footer={<>New here? <Link href="/register" className="text-gilt-300 font-medium hover:underline">Create an account</Link></>}
    >
      <Suspense fallback={<p className="text-center text-sm text-white/40">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
