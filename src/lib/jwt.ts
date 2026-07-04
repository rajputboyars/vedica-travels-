import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import type { UserRole } from '@/types'

export interface AuthTokenPayload {
  sub: string // user id
  email: string
  role: UserRole
}

// Signs/verifies the session token for the custom MongoDB+JWT auth system.
// Deliberately separate from next-auth's JWT handling (used only by the
// legacy admin login) — different secret, different payload shape, no
// shared code path to keep the two systems independent.
export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] })
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload
}
