import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie'

// Two jobs, both intentionally lightweight:
//
// 1. Security headers on every response.
//
// 2. A cheap *presence* check for the reserved customer-dashboard prefix
//    (/account/**, not built yet) — redirect to /login if the session
//    cookie is simply missing. This does NOT verify the JWT's signature
//    or expiry; that happens server-side in requireAuth()/requireRole()
//    (src/lib/auth-guard.ts) for every actual data-touching request.
//
// Full JWT verification was deliberately kept out of edge middleware — see
// the comment in features/admin/components/AdminShell.tsx: a previous
// version verified the admin session's JWT here and it was flaky in
// production (edge runtime + secret propagation issues on Vercel). A
// presence-only redirect has no such failure mode: worst case, a request
// with a missing cookie reaches /account, finds no session in
// requireAuth(), and gets a 401 — same outcome, just one hop later.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/account')) {
    const hasSession = req.cookies.has(AUTH_COOKIE_NAME)
    if (!hasSession) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  const res = NextResponse.next()
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return res
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}
