import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth-error'

interface StatusError extends Error {
  status: number
}

function hasStatus(e: unknown): e is StatusError {
  return e instanceof Error && typeof (e as { status?: unknown }).status === 'number'
}

// Shared error -> HTTP response mapping so every route handler has
// identical behavior instead of re-writing the same try/catch. Generic
// over any "has a numeric .status" error (not just AuthError) so feature
// services can throw their own typed errors (e.g.
// registration.service.ts's RegistrationError) without this lib file
// having to import every feature's error class — that would make
// lib/api-error.ts depend on services/, backwards from how the layers
// are supposed to point.
export function apiError(e: unknown): NextResponse {
  if (e instanceof AuthError || hasStatus(e)) {
    return NextResponse.json({ error: e.message }, { status: e.status })
  }
  console.error(e)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}
