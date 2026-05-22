import type { Metadata } from "next";
import Link from "next/link";

import { DashboardSearchLaunch } from "@/components/devotees/DashboardSearchLaunch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-zinc-600">Tổng quan nhanh và tra cứu đạo hữu.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tra cứu đạo hữu</CardTitle>
          <CardDescription>Nhập từ khóa (có thể không dấu) rồi chuyển tới trang kết quả.</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardSearchLaunch />
          <p className="mt-3 text-sm text-zinc-600">
            Hoặc mở trực tiếp{" "}
            <Link href="/devotees" className="font-medium text-zinc-900 underline underline-offset-2">
              trang Đạo hữu
            </Link>
            .
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý hồ sơ</CardTitle>
          <CardDescription>Danh sách và hồ sơ chi tiết đạo hữu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/devotees"
            className="inline-flex text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
          >
            Mở tra cứu đạo hữu →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
