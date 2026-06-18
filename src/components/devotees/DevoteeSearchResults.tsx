import Link from "next/link";
import { MapPin, Search, SearchX, User } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
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
          <div className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm shadow-stone-900/5">
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

function ResultAvatar({ url }: { url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-11 shrink-0 rounded-full object-cover ring-2 ring-amber-100" />
    );
  }

  return (
    <div
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground ring-2 ring-amber-100"
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
          "rounded-lg border border-dashed border-border bg-card/70 px-6 py-10 text-center",
          className,
        )}
      >
        <Search className="mx-auto size-8 text-muted-foreground/60" aria-hidden />
        <p className="mt-3 text-sm text-muted-foreground">
          Nhập từ khóa để tìm theo tên, pháp danh, quê quán, địa chỉ…
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card py-12 text-center shadow-sm shadow-stone-900/5",
          className,
        )}
        role="status"
      >
        <div className="rounded-full bg-muted p-3">
          <SearchX className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-sm font-medium text-stone-700">Không có kết quả phù hợp</p>
        <p className="text-xs text-muted-foreground">Thử từ khóa khác hoặc bỏ dấu tiếng Việt</p>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="sticky top-0 hidden grid-cols-[minmax(16rem,1.4fr)_minmax(9rem,0.7fr)_minmax(12rem,1fr)_minmax(12rem,1.2fr)] gap-4 border-b border-border bg-stone-50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground md:grid">
        <span>Đạo hữu</span>
        <span>Ngày sinh</span>
        <span>Quê quán</span>
        <span>Địa chỉ</span>
      </div>
      <ul className="divide-y divide-stone-100">
        {results.map((row, index) => (
          <li key={row.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
          <Link
            href={`/devotees/${row.id}`}
            className="group grid gap-3 px-4 py-4 transition-colors duration-200 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:grid-cols-[minmax(16rem,1.4fr)_minmax(9rem,0.7fr)_minmax(12rem,1fr)_minmax(12rem,1.2fr)] md:items-center"
          >
            <div className="flex min-w-0 items-start gap-3">
              <ResultAvatar url={row.profile_picture_url} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base transition-colors group-hover:text-primary">{row.full_name}</CardTitle>
                  {row.rank_score != null ? (
                    <span
                      className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground ring-1 ring-amber-200/70"
                      title="Điểm khớp"
                    >
                      Khớp {Number(row.rank_score).toFixed(2)}
                    </span>
                  ) : null}
                </div>
                {row.dharma_name ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">Pháp danh: {row.dharma_name}</p>
                ) : null}
              </div>
            </div>
            <p className="text-sm text-stone-700 md:text-muted-foreground">
              <span className="font-medium text-stone-700 md:hidden">Ngày sinh: </span>
              {formatDate(row.birth_date)}
            </p>
            <p className="flex items-start gap-1 text-sm text-stone-700 md:text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground md:hidden" aria-hidden />
              <span>
                <span className="font-medium text-stone-700 md:hidden">Quê quán: </span>
                {row.hometown ?? "—"}
              </span>
            </p>
            <p className="text-sm text-stone-700 md:text-muted-foreground">
              <span className="font-medium text-stone-700 md:hidden">Địa chỉ: </span>
              {row.address ?? "—"}
            </p>
          </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
