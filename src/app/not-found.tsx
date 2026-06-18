import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-foreground">Không tìm thấy trang</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Trang bạn yêu cầu không tồn tại hoặc bạn không có quyền truy cập.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Về bảng điều khiển</Link>
      </Button>
    </div>
  );
}
