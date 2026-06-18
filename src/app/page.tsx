import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/dashboard");
    }
  } catch {
    // Missing Supabase env — still show landing for local README-driven setup.
  }

  return (
    <div className="app-gradient-bg flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <Card className="max-w-lg animate-scale-in overflow-hidden shadow-xl shadow-zinc-900/10">
        <div className="accent-bar h-1 w-full" />
        <CardHeader className="pb-4">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 ring-1 ring-amber-200/60">
            <BookOpen className="size-7 text-amber-800" aria-hidden />
          </div>
          <CardTitle className="text-2xl">Hồ sơ nhà chùa</CardTitle>
          <CardDescription className="text-base">
            Ứng dụng nội bộ quản lý hồ sơ đạo hữu và gia phả — tra cứu, chỉnh sửa và xuất PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="accent" className="w-full" size="lg">
            <Link href="/login">Đăng nhập quản trị</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
