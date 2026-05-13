import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DevoteeSearchRow } from "@/types/devotee";
import { cn } from "@/lib/utils";

type DevoteeSearchResultsProps = {
  results: DevoteeSearchRow[];
  loading: boolean;
  query: string;
  className?: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return value;
}

export function DevoteeSearchResults({ results, loading, query, className }: DevoteeSearchResultsProps) {
  if (loading) {
    return (
      <p className={cn("text-sm text-zinc-500", className)} role="status">
        Searching…
      </p>
    );
  }

  if (!query.trim()) {
    return (
      <p className={cn("text-sm text-zinc-500", className)}>
        Nhập từ khóa để tìm theo tên, pháp danh, quê quán, địa chỉ…
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className={cn("text-sm text-zinc-600", className)} role="status">
        Không có kết quả phù hợp.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {results.map((row) => (
        <li key={row.id}>
          <Link href={`/devotees/${row.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400">
            <Card className="transition-colors hover:border-zinc-300 hover:bg-zinc-50">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <CardTitle className="text-base">{row.full_name}</CardTitle>
                  <span className="text-xs font-medium text-zinc-500" title="Match score">
                    {row.rank_score != null ? `Match: ${Number(row.rank_score).toFixed(2)}` : null}
                  </span>
                </div>
                {row.dharma_name ? <p className="text-sm text-zinc-600">Pháp danh: {row.dharma_name}</p> : null}
              </CardHeader>
              <CardContent className="grid gap-1 text-sm text-zinc-600 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-zinc-700">Ngày sinh: </span>
                  {formatDate(row.birth_date)}
                </p>
                <p>
                  <span className="font-medium text-zinc-700">Quê quán: </span>
                  {row.hometown ?? "—"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium text-zinc-700">Địa chỉ: </span>
                  {row.address ?? "—"}
                </p>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
