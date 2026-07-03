'use client'
import { useCallback } from 'react'
import { useFetch } from '@/hooks/use-fetch'
import type { AuthUser } from '@/types'

// Customer-facing session hook (Phase 9 prereq). Built on the existing
// useFetch<T>() primitive (see use-fetch.ts) instead of re-implementing
// the fetch/loading/refetch dance, per the "no duplicate logic" rule.
//
// Deliberately separate from AdminShell's next-auth/react useSession --
// that hook tracks the legacy NextAuth admin session, while this one
// tracks the Phase 2 JWT `psauth_token` cookie via GET /api/auth/me
// (which, since the auth-guard fix, also recognizes a NextAuth admin
// session -- so this hook happens to work for the admin identity too, but
// its real purpose is customers).
//
// Any public page that needs "am I logged in" (Navbar, Login/Register
// pages, the Customer Dashboard) should use this hook rather than calling
// /api/auth/me directly.
export function useAuth() {
  const { data, loading, refetch } = useFetch<{ user: AuthUser | null }>('/api/auth/me', { user: null })

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await refetch()
  }, [refetch])

  return { user: data.user, loading, refresh: refetch, logout }
}
