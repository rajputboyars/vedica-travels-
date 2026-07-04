// Phase 12 (architecture-only) — extension point, not an implementation.
//
// Tour and Package already each have their own seat/availability model
// (see tour.service.ts's Tour fields and registration.service.ts's
// getSeatAvailability()/SeatAvailability for Package). "Hotel Booking",
// "Flight Booking", "Bus Booking", "Train Booking", and "Cab Booking"
// (Phase 12 future modules list) are all fundamentally the same shape --
// a bookable item with finite inventory, a price, and a date range -- so
// rather than let each one grow its own bespoke service with duplicated
// seat-math logic, they should each implement `InventoryProvider` and
// reuse the existing `AvailabilityResult` shape that
// registration.service.ts's `SeatAvailability` already models.
//
// When one of these is actually built:
//   1. Add its own Mongoose model + demo store (following the existing
//      Package/Tour pattern: models/, lib/demo/, services/).
//   2. Have its service export functions matching this contract's method
//      names (or wrap them in a class implementing InventoryProvider) so
//      a future generic "search across all inventory types" feature can
//      target one interface instead of five bespoke ones.
//   3. Booking creation still goes through each module's own service --
//      this contract standardizes the read-side (availability/search)
//      shape, not the write-side transactional logic, since that's
//      already correctly module-specific (see registration.service.ts's
//      comments on why seat-check + assignment is transactional).
//
// No code currently implements or consumes this interface.

export type InventoryProductType = 'tour' | 'package' | 'hotel' | 'flight' | 'bus' | 'train' | 'cab'

export interface AvailabilityQuery {
  productId: string
  /** ISO date; omitted for products (like today's Tour/Package) that are date-fixed rather than date-searchable. */
  date?: string
  travellers?: number
}

export interface AvailabilityResult {
  productId: string
  productType: InventoryProductType
  available: number
  totalCapacity: number
  price: number
  currency: string
}

export interface InventoryProvider {
  readonly productType: InventoryProductType
  getAvailability(query: AvailabilityQuery): Promise<AvailabilityResult>
}
