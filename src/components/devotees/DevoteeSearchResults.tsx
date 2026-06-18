import Link from "next/link";
import { MapPin, Search, SearchX, User } from "lucide-react";

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

function SearchSkeleton({ className }: { className?: string }) {
  return (
    <ul className={cn("space-y-3", className)} role="status" aria-label="Đang tìm">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="animate-scale-in" style={{ animationDelay: `${index * 80}ms` }}>
          <div className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="size-12 shrink-0 animate-shimmer rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 animate-shimmer rounded-md" />
              <div className="h-4 w-full animate-shimmer rounded-md" />
              <div className="h-4 w-2/3 animate-shimmer rounded-md" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ResultAvatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-12 shrink-0 rounded-full object-cover ring-2 ring-amber-100" />
    );
  }

  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50 text-amber-800 ring-2 ring-amber-100"
      aria-hidden
    >
      <User className="size-5" />
    </div>
  );
}

export function DevoteeSearchResults({ results, loading, query, className }: DevoteeSearchResultsProps) {
  if (loading) {
    return <SearchSkeleton className={className} />;
  }

  if (!query.trim()) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-zinc-200 bg-white/60 px-6 py-10 text-center",
          className,
        )}
      >
        <Search className="mx-auto size-8 text-zinc-300" aria-hidden />
        <p className="mt-3 text-sm text-zinc-500">
          Nhập từ khóa để tìm theo tên, pháp danh, quê quán, địa chỉ…
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center shadow-sm",
          className,
        )}
        role="status"
      >
        <div className="rounded-full bg-zinc-100 p-3">
          <SearchX className="size-8 text-zinc-400" aria-hidden />
        </div>
        <p className="text-sm font-medium text-zinc-700">Không có kết quả phù hợp</p>
        <p className="text-xs text-zinc-500">Thử từ khóa khác hoặc bỏ dấu tiếng Việt</p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {results.map((row, index) => (
        <li key={row.id} className="animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
          <Link
            href={`/devotees/${row.id}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2"
          >
            <Card className="card-interactive group overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-4">
                  <ResultAvatar url={row.profile_picture_url} name={row.full_name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <CardTitle className="text-base transition-colors group-hover:text-amber-900">
                        {row.full_name}
                      </CardTitle>
                      {row.rank_score != null ? (
                        <span
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200/60"
                          title="Điểm khớp"
                        >
                          Khớp {Number(row.rank_score).toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                    {row.dharma_name ? (
                      <p className="mt-0.5 text-sm text-zinc-600">Pháp danh: {row.dharma_name}</p>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-zinc-700">Ngày sinh: </span>
                  {formatDate(row.birth_date)}
                </p>
                <p className="flex items-start gap-1">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-zinc-400" aria-hidden />
                  <span>
                    <span className="font-medium text-zinc-700">Quê quán: </span>
                    {row.hometown ?? "—"}
                  </span>
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
