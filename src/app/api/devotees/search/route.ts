import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { searchQuerySchema } from "@/lib/validations/devotee";
import type { DevoteeSearchRow } from "@/types/devotee";

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({ q: searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const q = parsed.data.q.trim();
  if (!q) {
    return NextResponse.json({ results: [] as DevoteeSearchRow[] });
  }

  const { data, error } = await supabase.rpc("search_devotees", { query_text: q });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const raw = (data ?? []) as DevoteeSearchRow[];

  const results = raw.map((row) => ({
    ...row,
    rank_score: typeof row.rank_score === "string" ? Number.parseFloat(row.rank_score) : row.rank_score,
  }));

  return NextResponse.json({ results });
}
