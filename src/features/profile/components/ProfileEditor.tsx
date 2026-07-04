'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { LEGACY_ADMIN_ID } from '@/lib/auth'
import type { AuthUser } from '@/types'

// Shared "View Profile / Edit Profile" + "Change Password" UI, consumed by
// both the Admin Profile page (Phase 8) and the Customer Dashboard profile
// page (Phase 9) — per the standing "no duplicate logic" instruction,
// there's exactly one implementation of this flow, wired to the exact same
// GET /api/auth/me, PATCH /api/auth/me, PUT /api/auth/change-password
// endpoints regardless of which shell it's rendered inside.
//
// The one special case: the legacy NextAuth admin identity (env-var based,
// id === LEGACY_ADMIN_ID) has no database record to update. Rather than
// letting the edit form 404 on submit, we detect it up front and point the
// admin at /admin/settings, which already documents how to change that
// identity's email/password (via .env).
export default function ProfileEditor() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          setName(data.user.name)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-8">
        <Loader2 size={16} className="animate-spin" /> Loading profile…
      </div>
    )
  }

  if (!user) {
    return <p className="text-sm text-gray-500">Could not load profile. Please sign in again.</p>
  }

  const isEnvManagedIdentity = user._id === LEGACY_ADMIN_ID

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setSavingName(true)
    setNameMsg(null)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      setUser(data.user)
      setNameMsg({ type: 'ok', text: 'Profile updated.' })
    } catch (err) {
      setNameMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to update profile' })
    } finally {
      setSavingName(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordMsg(null)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setPasswordMsg({ type: 'ok', text: 'Password changed.' })
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to change password' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User size={18} className="text-orange-600" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Role</span>
            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
          </div>

          {isEnvManagedIdentity ? (
            <p className="text-xs text-gray-400 pt-1">
              This admin account is configured via environment variables, not a database record —
              there&apos;s no name/password to edit here. See{' '}
              <a href="/admin/settings" className="text-orange-600 underline">Settings</a> for how to
              change its email/password.
            </p>
          ) : (
            <form onSubmit={saveName} className="space-y-3 pt-1">
              <label className="block">
                <span className="text-sm text-gray-600 mb-1 block">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </label>
              {nameMsg && (
                <p className={`text-xs flex items-center gap-1 ${nameMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                  {nameMsg.type === 'ok' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {nameMsg.text}
                </p>
              )}
              <Button type="submit" disabled={savingName} size="sm">
                {savingName ? 'Saving…' : 'Save Changes'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {!isEnvManagedIdentity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock size={18} className="text-orange-600" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePassword} className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-600 mb-1 block">Current Password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600 mb-1 block">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </label>
              {passwordMsg && (
                <p className={`text-xs flex items-center gap-1 ${passwordMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordMsg.type === 'ok' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {passwordMsg.text}
                </p>
              )}
              <Button type="submit" disabled={savingPassword} size="sm">
                {savingPassword ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
