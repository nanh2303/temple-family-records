/**
 * Client-side normalization for display and lightweight pre-processing.
 * Authoritative accent-insensitive matching happens in Postgres via `unaccent`.
 */
export function normalizeVietnameseClient(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}
