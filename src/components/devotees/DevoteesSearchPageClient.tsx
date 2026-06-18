"use client";

import { FileSpreadsheet, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DevoteeSearchBox } from "@/components/devotees/DevoteeSearchBox";
import { DevoteeSearchResults } from "@/components/devotees/DevoteeSearchResults";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      const res = await fetch(buildDevoteeSearchUrl(q), {
        method: "GET",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { results: DevoteeSearchRow[] };
      setResults(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tìm kiếm thất bại.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional async search pipeline
    void runSearch(debounced);
  }, [debounced, runSearch]);

  return (
    <div className="space-y-6">
      <div className="animate-slide-down flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tra cứu đạo hữu</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Tìm theo mảnh thông tin: tên, pháp danh, quê quán, địa chỉ — hỗ trợ không dấu và dấu sai lệch nhẹ.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/devotees/import">
              <FileSpreadsheet aria-hidden />
              Nhập CSV
            </Link>
          </Button>
          <Button asChild variant="accent">
            <Link href="/devotees/new">
              <Plus aria-hidden />
              Thêm đạo hữu
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden shadow-md shadow-zinc-900/5">
        <div className="accent-bar h-1 w-full" />
        <CardContent className="p-6">
          <DevoteeSearchBox value={query} onChange={setQuery} loading={loading} />
        </CardContent>
      </Card>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <DevoteeSearchResults results={results} loading={loading} query={debounced} />
    </div>
  );
}
