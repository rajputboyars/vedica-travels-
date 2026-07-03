// Phase 12 (architecture-only) extension point: future roles (e.g.
// 'agent' for a Travel Agent Portal, 'vendor' for a Vendor Portal,
// 'branch_manager' for Branch/Franchise Management -- see
// docs/PHASE_12_ARCHITECTURE.md) are added to this union when those
// features are actually built, not before. Adding a value here is
// backward-compatible: the User model stores role as a plain string
// (see models/User.ts), so no migration is needed, and requireRole()
// already accepts `UserRole | UserRole[]` to gate multi-role routes.
export type UserRole = 'admin' | 'customer'
export type AuthProvider = 'credentials' | 'google'

// Public-safe user shape — never include passwordHash or raw tokens here.
export interface AuthUser {
  _id: string
  name: string
  email: string
  role: UserRole
  emailVerified: boolean
  provider: AuthProvider
  createdAt: string
}
