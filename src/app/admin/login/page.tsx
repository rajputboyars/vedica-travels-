'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import AuthShell, { SubmitButton } from '@/components/lux/AuthShell'
import Field, { Input } from '@/components/lux/Field'
import { siteConfig } from '@/config/site'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Invalid credentials. Please try again.')
    } else {
      router.push('/admin')
    }
  }

  return (
    <AuthShell icon={Lock} title="Admin Login" subtitle={siteConfig.name}>
      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={siteConfig.contact.email} />
        </Field>
        <Field label="Password" htmlFor="password" error={error}>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
        </Field>
        <SubmitButton type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login to Admin'}</SubmitButton>
      </form>
    </AuthShell>
  )
}
