export function buildDevoteeSearchUrl(query: string): string {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  const qs = params.toString();
  return qs ? `/api/devotees/search?${qs}` : "/api/devotees/search";
}
