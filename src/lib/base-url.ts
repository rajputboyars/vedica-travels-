import { headers } from 'next/headers'

// Resolves the app's base URL from the incoming request so server-side
// fetches work on any host/port (dev on 3001, prod, etc.).
export async function getBaseUrl() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || 'http'
  return process.env.NEXTAUTH_URL || `${proto}://${host}`
}
