// Phase 12 (architecture-only) — extension point, not an implementation.
//
// "AI Trip Planner" and "AI Chatbot"/"AI Travel Assistant" (Phase 12 /
// project-instructions future-features list) are two distinct
// interaction shapes -- one produces a structured itinerary, the other is
// conversational -- so they get two small contracts rather than one
// catch-all "AI service" interface. Both take `context` as free-form
// key/value data so a future implementation can pass in whatever it
// needs (destination, budget, dates, prior messages) without the
// interface itself needing to change as the feature is designed.
//
// When either is actually built, an implementation (e.g. wrapping the
// Claude API) would live in its own service file
// (services/ai-trip-planner.service.ts, services/ai-chat.service.ts) and
// implement these interfaces; route handlers and UI would depend on the
// interface, not the specific model/provider.
//
// No code currently implements or consumes this interface.

export interface TripPlanRequest {
  destination?: string
  budget?: number
  travellers?: number
  startDate?: string
  endDate?: string
  preferences?: string[]
  context?: Record<string, unknown>
}

export interface TripPlanDay {
  day: number
  title: string
  description: string
  suggestedPackageIds?: string[]
}

export interface TripPlanResult {
  summary: string
  days: TripPlanDay[]
}

export interface AITripPlanner {
  planTrip(request: TripPlanRequest): Promise<TripPlanResult>
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  /** Package/Tour ids the assistant is recommending, if any, so the UI can render rich cards instead of plain text. */
  suggestedPackageIds?: string[]
}

export interface AIChatAssistant {
  respond(history: ChatMessage[], context?: Record<string, unknown>): Promise<ChatResponse>
}
