// Shared slug generator — originally lived only in lib/demo/packages.ts;
// extracted here so the new Blog CMS entity (Phase 10) can reuse the exact
// same slugging rules instead of a second copy. demo/packages.ts re-exports
// this so its existing `demo.slugify` callers (package.service.ts) are
// unaffected.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}
