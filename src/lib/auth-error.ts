// Typed error so API routes can map it to the right HTTP status without
// string-matching messages. Thrown by auth.service.ts and auth-guard.ts.
export class AuthError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}
