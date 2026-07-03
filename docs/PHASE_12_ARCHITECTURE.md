# Phase 12 — Future Expansion Architecture (Architecture Only)

This document is the deliverable for Phase 12: "review the complete project architecture; prepare the application for future features without breaking existing code." Per the Phase 12 brief, **nothing in this document is implemented yet** — no Hotel/Flight/Bus/Train/Cab booking, no Visa Services, Travel Insurance, Coupons, Referral System, Loyalty Points, Wallet, AI Trip Planner, AI Chatbot, WhatsApp/SMS notifications, Travel Agent Portal, Vendor Portal, Multiple Admin Roles, Branch/Franchise Management, or Mobile App APIs exist in the codebase after this phase. What exists is: a set of TypeScript interface contracts (`src/services/contracts/`), one small backward-compatible widening of `requireRole()`, and this document explaining how each future module is expected to slot into the current architecture when it's actually built.

## 1. Current architecture, in one page

The codebase follows a strict layered flow, enforced by convention rather than a framework:

```
types/ (shape)  →  models/ (Mongoose schema)  →  lib/demo/ (in-memory seed, same shape)
                                                          ↓
                                            services/*.service.ts (business logic)
                                                          ↓
                                app/api/**/route.ts  (HTTP)  +  app/**/page.tsx (Server Components)
                                                          ↓
                                            features/**/components (client interactivity)
```

Two rules make this extensible without a rewrite every time a feature is added:

- **"One door in."** Routes and Server Components never import a Mongoose model or a demo store directly — only a `services/*.service.ts` function. This is why every existing service (`package.service.ts`, `tour.service.ts`, `registration.service.ts`, `cms.service.ts`, ...) is the single place that knows whether the app is in demo mode or DB mode (`isDBConfigured`, `config/env.ts`). A new module that follows this pattern automatically gets demo-mode support for free and never leaks Mongoose types into a route handler.
- **Demo/DB parity.** Every collection has a Mongoose model *and* an in-memory demo store with an identical serialized shape (see `services/serialize.ts`). New modules should do the same, so local development and previews never require a provisioned database.

Auth today is two systems living side by side (documented in `lib/auth-guard.ts`): a JWT cookie (customers, Phase 2) and a legacy NextAuth session (the single hardcoded admin). `getCurrentUser()` checks the JWT first, then falls back to NextAuth. `requireRole(role)` gates API routes by role. This matters for Phase 12 because four of the listed future modules (Travel Agent Portal, Vendor Portal, Multiple Admin Roles, Branch/Franchise Management) are fundamentally about *more roles and more scopes*, not a new auth system — see §3.

## 2. Extension points added this phase

### 2.1 `requireRole()` now accepts multiple roles

`src/lib/auth-guard.ts`'s `requireRole()` signature changed from `requireRole(role: UserRole)` to `requireRole(role: UserRole | UserRole[])`. Every one of the 28 existing call sites (`requireRole('admin')`) still type-checks unchanged — a single string satisfies `UserRole | UserRole[]`. This is what lets a future route say `requireRole(['admin', 'agent'])` once an `agent` role exists, without another signature change.

### 2.2 `UserRole` documents its own extension path

`src/types/user.ts` now has a comment explaining that new roles (`'agent'`, `'vendor'`, `'branch_manager'`, ...) are added to the `UserRole` union only when the corresponding feature is built — not speculatively. Because `models/User.ts` stores `role` as a plain string field (not a hard Mongoose enum with a fixed set), adding a new role value is a type-level change only: no migration, no schema change, no risk to existing admin/customer accounts.

### 2.3 `src/services/contracts/` — interfaces for future modules

Six new files, each pure TypeScript interfaces with **no implementation and no current consumer**:

| File | Covers | Rationale |
|---|---|---|
| `notification.contract.ts` | WhatsApp Notifications, SMS Notifications | Generalizes `lib/mailer.ts`'s `sendMail()` shape into a `NotificationChannel` interface so a future WhatsApp/SMS channel is a new implementation, not scattered `if (whatsappEnabled)` branches through every service that currently emails. |
| `inventory.contract.ts` | Hotel/Flight/Bus/Train/Cab Booking | Generalizes the availability-check pattern that already exists for Tours/Packages (`registration.service.ts`'s `getSeatAvailability()`/`SeatAvailability`) into an `InventoryProvider` interface, so five new booking types can share one "search availability" shape instead of five bespoke ones. Booking *creation* stays module-specific on purpose (see the file's comments on why seat-check + assignment must stay transactional per module). |
| `payment.contract.ts` | Travel EMI/online payments, Travel Wallet, (supports Coupons) | Today every booking is "pay by QR, admin verifies manually" (see `Package.paymentNote`/`qrImages`, the admin payment-verification dashboard). A real gateway integration (Razorpay/Stripe/etc.) implements `PaymentGateway`; a wallet balance implements `WalletProvider`; booking code depends on the interface, not a specific SDK. |
| `promotions.contract.ts` | Coupons, Referral System, Loyalty Points | All three reduce to "does this booking qualify for a discount, and how much" at checkout time. One `DiscountEngine` contract means the future booking flow gets one integration point instead of three parallel conditionals. `LoyaltyProgram` is separate since points *balance* (not just a discount) is stateful. |
| `ai.contract.ts` | AI Trip Planner, AI Chatbot/Travel Assistant | Two distinct interaction shapes (structured itinerary vs. conversational) get two small contracts (`AITripPlanner`, `AIChatAssistant`) rather than one catch-all interface, since their inputs/outputs genuinely differ. |
| `org-scope.contract.ts` | Travel Agent Portal, Vendor Portal, Branch Management, Franchise Management | All four introduce *some other organizational entity* that owns a subset of packages/bookings and should only see their own. `OrgScopedEntity`/`OrgScopeGuard` is the shared shape; see §3 for how this composes with `UserRole`. |

`src/services/contracts/index.ts` barrels all six. Nothing in the existing codebase imports from this folder — it exists purely as a contract for future implementers (human or agent) to build against, the same way an interface in any layered codebase precedes its implementation.

## 3. How each future module is expected to land (when actually built)

This section is guidance for whoever (or whichever future session) implements each module — it is not a promise about implementation order.

**Hotel / Flight / Bus / Train / Cab Booking** — Each gets its own `models/<Thing>.ts` + `lib/demo/<things>.ts` + `services/<thing>.service.ts`, following the Package/Tour precedent exactly (singleton-vs-collection decisions, demo/DB parity, `serialize()`). Each service implements `InventoryProvider` from `inventory.contract.ts` for the read/search side. Booking creation reuses the existing seat-check-then-assign transactional pattern from `registration.service.ts` rather than inventing a new one.

**Visa Services / Travel Insurance** — These are closer to "one-off add-on products attached to an existing booking" than new inventory types. Model as an optional add-on referenced from Registration/Booking (an array of `{ type: 'visa' | 'insurance', ... }`), not a new top-level booking flow.

**Coupons / Referral System / Loyalty Points / Wallet** — Implement `DiscountEngine`/`LoyaltyProgram`/`WalletProvider`/`PaymentGateway` from `promotions.contract.ts` and `payment.contract.ts`. Wire into `registration.service.ts`'s `createRegistration()` (or its future generalized booking equivalent) at the point price is calculated, not scattered across UI components.

**AI Trip Planner / AI Chatbot** — Implement `AITripPlanner`/`AIChatAssistant` from `ai.contract.ts` in new `services/ai-*.service.ts` files. These are read-heavy (recommend packages, answer questions) and should call existing services (`listPackages`, `listTours`) for candidate data rather than duplicating catalog logic.

**WhatsApp / SMS Notifications** — Implement `NotificationChannel` from `notification.contract.ts`. Existing `sendMail()` call sites (registration confirmations, password resets, trip reminders) can be migrated to a small channel-registry incrementally; this is explicitly *not* a rewrite of `lib/mailer.ts`, which keeps working as the `'email'` channel.

**Travel Agent Portal / Vendor Portal / Branch Management / Franchise Management / Multiple Admin Roles** — All five need: (a) a new `UserRole` value, (b) an `Organization` model (`id`, `type: 'agent' | 'vendor' | 'branch' | 'franchise'`, `name`, ...), (c) an optional `organizationId?: string` added to Package/Tour/Registration (optional keeps existing single-tenant data valid with no migration — it's implicitly "owned by HQ"), and (d) an `OrgScopeGuard` implementation (from `org-scope.contract.ts`) used alongside `requireRole()` in route handlers. The admin nav (`config/nav.ts`) gets new sections gated by role, following the same pattern as the existing "Website CMS" section added in Phase 10.

**Mobile App APIs** — The existing `app/api/**/route.ts` handlers are already plain REST-ish JSON endpoints with role-gated auth (JWT cookie), so a mobile client is mostly a matter of exposing the JWT auth flow over a header-based token (rather than the cookie) instead of building parallel endpoints. If/when this is built, prefer versioning new mobile-specific response shapes under `app/api/v1/**` rather than changing existing route response shapes, to keep the current web client's contract stable.

## 4. What was deliberately *not* changed

- No new Mongoose models, demo stores, or API routes were added for any future module — only the shared contracts and the two small auth extension points above.
- No existing service, route, or component's behavior changed. `npx tsc --noEmit` and `npx eslint` were run clean across the full project after this phase (see verification task in the project task list).
- No new dependencies were added.
