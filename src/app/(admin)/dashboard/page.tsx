import type { Metadata } from "next";
import Link from "next/link";
import { FileUp, Search, UserPlus } from "lucide-react";

import { DashboardSearchLaunch } from "@/components/devotees/DashboardSearchLaunch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="animate-slide-down">
        <h1 className="text-2xl font-semibold text-foreground">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tổng quan nhanh và tra cứu đạo hữu.</p>
      </div>

      <Card className="overflow-hidden shadow-md shadow-stone-900/5">
        <div className="accent-bar h-1 w-full" />
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="size-5 text-primary" aria-hidden />
            <CardTitle>Tra cứu đạo hữu</CardTitle>
          </div>
          <CardDescription>Nhập từ khóa (có thể không dấu) rồi chuyển tới trang kết quả.</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardSearchLaunch />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="card-interactive group overflow-hidden">
          <div className="accent-bar h-1 w-full opacity-60 transition-opacity group-hover:opacity-100" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2.5 text-accent-foreground ring-1 ring-amber-200/70">
                <UserPlus className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base">Thêm đạo hữu</CardTitle>
                <CardDescription className="mt-1">Tạo hồ sơ đạo hữu mới.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="accent">
              <Link href="/devotees/new">
                <UserPlus aria-hidden />
                Thêm đạo hữu
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-interactive group overflow-hidden">
          <div className="accent-bar h-1 w-full opacity-60 transition-opacity group-hover:opacity-100" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2.5 text-stone-700 ring-1 ring-border">
                <FileUp className="size-5" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base">Nhập CSV</CardTitle>
                <CardDescription className="mt-1">Import hàng loạt từ file CSV.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href="/devotees/import">
                <FileUp aria-hidden />
                Nhập CSV
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
