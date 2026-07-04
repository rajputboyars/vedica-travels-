import { NextResponse } from 'next/server'

// Single source of truth for the session cookie name/shape used by the
// custom MongoDB+JWT auth system. Kept separate from next-auth's own
// cookie (used only by the legacy admin login) so the two systems never
// collide or share state.
export const AUTH_COOKIE_NAME = 'psauth_token'

// 30 days — matches the default JWT_EXPIRES_IN in config/env.ts. If you
// change JWT_EXPIRES_IN, update this too; the cookie's Max-Age doesn't
// derive from the JWT's own `exp` claim, it's just how long the browser
// keeps sending the cookie. The JWT's signature/expiry is still verified
// server-side on every request via verifyAuthToken.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}
