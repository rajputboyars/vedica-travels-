// Phase 12 (architecture-only) — extension point, not an implementation.
//
// "Travel Agent Portal", "Vendor Portal", "Branch Management", and
// "Franchise Management" (Phase 12 future modules list) all describe the
// same underlying need: today every Package/Tour/Registration belongs to
// one single business (there is no ownership field because there is only
// one Vedica Travels), but each of those four features introduces some
// other organizational entity (an agent, a vendor, a branch, a franchise)
// that owns a subset of packages/bookings and should only see their own.
//
// Rather than bolt an `agentId` field onto Package, a `vendorId` onto
// Tour, a `branchId` onto Registration, etc. independently (and duplicate
// the "does this org own this record" check in every service), the
// contract below is the shared shape: any future org-scoped entity
// implements `OrgScopedEntity`, and access control funnels through
// `OrgScopeGuard` the same way role-based access already funnels through
// `requireRole()` in lib/auth-guard.ts.
//
// When one of these four is actually built:
//   1. Add an `Organization` model (id, type: 'agent' | 'vendor' |
//      'branch' | 'franchise', name, ...).
//   2. Add an optional `organizationId?: string` field to the relevant
//      existing models (Package, Tour, Registration) -- optional keeps it
//      backward-compatible; existing single-tenant data simply has no
//      organizationId and is implicitly "owned by Vedica Travels HQ".
//   3. Extend UserRole (see types/user.ts) with the matching role, and
//      add an OrgScopeGuard implementation that checks
//      `user.organizationId` against the record's `organizationId`.
//
// No code currently implements or consumes this interface.

export type OrganizationType = 'hq' | 'agent' | 'vendor' | 'branch' | 'franchise'

export interface OrgScopedEntity {
  organizationId?: string
}

export interface OrgScopeGuard {
  /** Returns true if `user` (identified by organizationId) may access a record with the given organizationId. HQ-scoped users (organizationId undefined) always pass. */
  canAccess(userOrganizationId: string | undefined, recordOrganizationId: string | undefined): boolean
}
