"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DevoteeSearchBox } from "@/components/devotees/DevoteeSearchBox";
import { DevoteeSearchResults } from "@/components/devotees/DevoteeSearchResults";
import { Button } from "@/components/ui/button";
import { buildDevoteeSearchUrl } from "@/lib/search/buildSearchQuery";
import type { DevoteeSearchRow } from "@/types/devotee";

const DEBOUNCE_MS = 320;

type DevoteesSearchPageClientProps = {
  initialQuery?: string;
};

export function DevoteesSearchPageClient({ initialQuery = "" }: DevoteesSearchPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [results, setResults] = useState<DevoteeSearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(buildDevoteeSearchUrl(q), { method: "GET", credentials: "same-origin" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { results: DevoteeSearchRow[] };
      setResults(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounced remote search; state updates reflect fetch lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional async search pipeline
    void runSearch(debounced);
  }, [debounced, runSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tra cứu đạo hữu</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Tìm theo mảnh thông tin: tên, pháp danh, quê quán, địa chỉ - hỗ trợ không dấu và dấu sai lệch nhẹ.
          </p>
        </div>
        <Button asChild>
          <Link href="/devotees/new">
            <Plus aria-hidden />
            Thêm Phật tử
          </Link>
        </Button>
      </div>
      <DevoteeSearchBox value={query} onChange={setQuery} />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <DevoteeSearchResults results={results} loading={loading} query={debounced} />
    </div>
  );
}
