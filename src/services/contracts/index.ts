// Phase 12 (architecture-only) — barrel for every future-module contract.
// See docs/PHASE_12_ARCHITECTURE.md for the full design rationale. Every
// file here is a set of TypeScript interfaces only: no runtime code, no
// implementations, nothing imported by existing services. They exist so
// that when a Phase 12 future module is actually built, its service layer
// has an agreed-upon shape to implement instead of inventing one from
// scratch (and so a reviewer/future-agent can see, in one place, how a
// new module is expected to slot into the existing service-layer
// architecture — see CLAUDE.md's "one door in" / services-only-touch-
// models rule that every existing service already follows).
export * from './notification.contract'
export * from './inventory.contract'
export * from './payment.contract'
export * from './promotions.contract'
export * from './ai.contract'
export * from './org-scope.contract'
