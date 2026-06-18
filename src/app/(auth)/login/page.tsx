import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Temple family records — administrator sign in",
};

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="app-gradient-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md animate-slide-up">
        <div className="accent-bar h-1 w-full" />
        <CardHeader>
          <CardTitle>Đăng nhập quản trị</CardTitle>
          <CardDescription>Ứng dụng nội bộ — chỉ dành cho ban quản trị chùa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải…</p>}>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="underline underline-offset-2 transition-colors hover:text-foreground">
              Về trang chủ
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
