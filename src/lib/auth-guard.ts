import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { verifyAuthToken } from '@/lib/jwt'
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie'
import { AuthError } from '@/lib/auth-error'
import { authOptions, LEGACY_ADMIN_ID } from '@/lib/auth'
import { getUserById } from '@/services/auth.service'
import type { AuthUser, UserRole } from '@/types'

// Synthesizes an AuthUser for the legacy NextAuth admin session. That
// session only ever represents the single hardcoded admin identity (see
// authOptions in lib/auth.ts), so this is a fixed, well-known shape rather
// than something read from a database. Kept in one place so both
// getCurrentUser() below and anything else that needs "is this the
// NextAuth admin" stay in sync.
function nextAuthAdminUser(email: string, name: string | null | undefined): AuthUser {
  return {
    _id: LEGACY_ADMIN_ID,
    name: name || 'Admin',
    email,
    role: 'admin',
    emailVerified: true,
    provider: 'credentials',
    createdAt: new Date(0).toISOString(),
  }
}

// The one place API route handlers (and server components) go to find out
// "who is making this request". Verifies the JWT signature/expiry here in
// the Node.js runtime (not edge middleware) -- see the note in
// features/admin/components/AdminShell.tsx and src/middleware.ts for why
// edge-runtime auth checks are avoided in this codebase after a prior
// production incident.
//
// Two independent auth systems exist side by side: the Phase 2 JWT cookie
// (customers + any future JWT-based admin login) and the legacy NextAuth
// session that the actual admin panel (AdminShell.tsx) has always used.
// The JWT cookie is checked first since it's the more specific/newer
// system; if it's absent, we fall back to asking NextAuth for a session so
// the real admin -- who only ever logs in via NextAuth -- is recognized by
// every requireRole('admin') gated route built since Phase 3. This is
// additive: neither login flow changes, and JWT-authenticated users are
// unaffected.
export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies()
  const token = store.get(AUTH_COOKIE_NAME)?.value

  if (token) {
    try {
      const payload = verifyAuthToken(token)
      const user = await getUserById(payload.sub)
      if (user) return user
    } catch {
      // fall through to NextAuth check below
    }
  }

  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    return nextAuthAdminUser(session.user.email, session.user.name)
  }

  return null
}

// Throws AuthError(401) if there's no valid session -- call from any route
// handler that requires a logged-in user of any role.
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError('Authentication required', 401)
  return user
}

// Throws AuthError(401)/(403) if there's no valid session or the session's
// role doesn't match. Usage: `const admin = await requireRole('admin')`.
//
// Phase 12 (architecture-only): accepts a single role OR an array, so that
// future multi-role surfaces (Travel Agent Portal, Vendor Portal, Branch
// Management -- see docs/PHASE_12_ARCHITECTURE.md) can write
// `requireRole(['admin', 'agent'])` without a signature change. Every
// existing call site passes a single role string, which still satisfies
// `UserRole | UserRole[]` unchanged -- this is additive, not a breaking
// change.
export async function requireRole(role: UserRole | UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
  const allowedRoles = Array.isArray(role) ? role : [role]
  if (!allowedRoles.includes(user.role)) throw new AuthError('Insufficient permissions', 403)
  return user
}
