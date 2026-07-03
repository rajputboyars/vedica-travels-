import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { env } from '@/config/env'

// Extracted from the [...nextauth] route so `getServerSession(authOptions)`
// can be called from route handlers / server components that need to check
// the admin session, without re-declaring the provider config.
//
// Auth model today: a single admin identity from env vars. This is
// intentionally unchanged from the working app -- swapping in a database-
// backed, multi-admin, role-based provider is a real feature (see the
// "Future improvements" note in the admin settings page) and shouldn't be
// bundled into an architecture rewrite.

// The legacy NextAuth admin has no MongoDB/demo-store record -- it's a
// single identity sourced entirely from env vars -- so it always carries
// this fixed id. Exported so auth-guard.ts (which synthesizes an AuthUser
// for this session) and any UI that needs to special-case "this is the
// env-based identity, not a database user" (e.g. the Admin Profile page's
// edit-profile/change-password forms, which have nothing to update against
// for this identity) share one source of truth instead of repeating '1'.
export const LEGACY_ADMIN_ID = '1'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.email === env.adminEmail &&
          credentials?.password === env.adminPassword
        ) {
          return { id: LEGACY_ADMIN_ID, email: credentials!.email, name: 'Admin' }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  secret: env.nextAuthSecret,
}
