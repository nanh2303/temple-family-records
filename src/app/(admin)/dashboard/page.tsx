import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileUp, Search, UserPlus } from "lucide-react";

import { DashboardSearchLaunch } from "@/components/devotees/DashboardSearchLaunch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-9">
      <div className="animate-slide-down">
        <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Quản lý hồ sơ</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Bảng điều khiển</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Tra cứu và gìn giữ thông tin gia đình Phật tử trong một nơi.
        </p>
      </div>

      <Card className="overflow-hidden border-[#cfc3ad]">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-[#efe5cf] text-primary">
              <Search className="size-4" aria-hidden />
            </span>
            <div>
              <CardTitle className="text-lg">Tra cứu đạo hữu</CardTitle>
              <CardDescription className="mt-1">
                Tìm theo họ tên, pháp danh, quê quán hoặc thông tin hồ sơ.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <DashboardSearchLaunch />
        </CardContent>
      </Card>

      <section aria-labelledby="quick-actions-title" className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 id="quick-actions-title" className="text-lg font-semibold">Thao tác</h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/devotees/new"
            className="card-interactive group flex items-center gap-4 rounded-md border border-border bg-card p-5 text-foreground"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-primary text-[#fffaf2]">
              <UserPlus className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Thêm đạo hữu</span>
              <span className="mt-1 block text-sm text-muted-foreground">Tạo hồ sơ mới trong sổ gia đình.</span>
            </span>
            <ArrowRight
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
          <Link
            href="/devotees/import"
            className="card-interactive group flex items-center gap-4 rounded-md border border-border bg-card p-5 text-foreground"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-secondary text-secondary-foreground">
              <FileUp className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Nhập từ CSV</span>
              <span className="mt-1 block text-sm text-muted-foreground">Kiểm tra và nhập nhiều hồ sơ cùng lúc.</span>
            </span>
            <ArrowRight
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
