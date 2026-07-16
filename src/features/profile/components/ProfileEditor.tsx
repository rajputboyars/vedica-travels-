'use client'
import { useEffect, useState } from 'react'
import { User, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { luxInputClass, luxLabelClass } from '@/components/lux/Field'
import { LEGACY_ADMIN_ID } from '@/lib/auth'
import type { AuthUser } from '@/types'

// Shared "View Profile / Edit Profile" + "Change Password" UI, consumed by
// both the Admin Profile page and the Customer Dashboard profile page —
// per the standing "no duplicate logic" instruction, there's exactly one
// implementation of this flow, wired to the exact same GET /api/auth/me,
// PATCH /api/auth/me, PUT /api/auth/change-password endpoints regardless
// of which (dark) shell it's rendered inside.
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
      <div className="flex items-center gap-2 text-white/40 text-sm py-8">
        <Loader2 size={16} className="animate-spin" /> Loading profile…
      </div>
    )
  }

  if (!user) {
    return <p className="text-sm text-white/50">Could not load profile. Please sign in again.</p>
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
      <div className="rounded-3xl glass gilt-border p-6">
        <h2 className="text-base font-medium text-white flex items-center gap-2 mb-5">
          <User size={18} className="text-gilt-300" /> Account
        </h2>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2.5 border-b border-white/5">
            <span className="text-sm text-white/55">Email</span>
            <span className="text-sm font-medium text-white">{user.email}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-white/5">
            <span className="text-sm text-white/55">Role</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70 capitalize">{user.role}</span>
          </div>

          {isEnvManagedIdentity ? (
            <p className="text-xs text-white/40 pt-3 leading-relaxed">
              This admin account is configured via environment variables, not a database record —
              there&apos;s no name/password to edit here. See{' '}
              <a href="/admin/settings" className="text-gilt-300 underline">Settings</a> for how to
              change its email/password.
            </p>
          ) : (
            <form onSubmit={saveName} className="space-y-3 pt-3">
              <label className="block">
                <span className={luxLabelClass}>Name</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={luxInputClass} required />
              </label>
              {nameMsg && (
                <p className={`text-xs flex items-center gap-1 ${nameMsg.type === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {nameMsg.type === 'ok' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {nameMsg.text}
                </p>
              )}
              <button type="submit" disabled={savingName} className="inline-flex items-center rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-5 py-2 text-sm font-semibold text-ink-900 gilt-glow disabled:opacity-60">
                {savingName ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>

      {!isEnvManagedIdentity && (
        <div className="rounded-3xl glass gilt-border p-6">
          <h2 className="text-base font-medium text-white flex items-center gap-2 mb-5">
            <Lock size={18} className="text-gilt-300" /> Change Password
          </h2>
          <form onSubmit={savePassword} className="space-y-3">
            <label className="block">
              <span className={luxLabelClass}>Current Password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={luxInputClass} required />
            </label>
            <label className="block">
              <span className={luxLabelClass}>New Password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} className={luxInputClass} required />
            </label>
            {passwordMsg && (
              <p className={`text-xs flex items-center gap-1 ${passwordMsg.type === 'ok' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {passwordMsg.type === 'ok' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} {passwordMsg.text}
              </p>
            )}
            <button type="submit" disabled={savingPassword} className="inline-flex items-center rounded-full bg-gradient-to-r from-gilt-300 to-gilt-500 px-5 py-2 text-sm font-semibold text-ink-900 gilt-glow disabled:opacity-60">
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
