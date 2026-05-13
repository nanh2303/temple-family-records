import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-16 text-center">
      <div className="max-w-lg space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Temple family records</h1>
        <p className="text-sm text-zinc-600">
          Internal admin application for Buddhist temple devotee and family registry data — search, profiles, and PDF
          export.
        </p>
      </div>
      <Button asChild>
        <Link href="/login">Administrator sign in</Link>
      </Button>
    </div>
  );
}
