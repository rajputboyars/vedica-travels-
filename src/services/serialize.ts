// Mongoose documents carry ObjectId/Date fields and class methods that
// don't survive as-is across the server/client boundary. Round-tripping
// through JSON gives a plain object shaped like our DTOs (ObjectId -> hex
// string, Date -> ISO string) — the same trick the original edit-tour page
// used ad hoc; centralizing it here means every service returns identical
// shapes whether the source was MongoDB or the in-memory demo store.
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T
}
