import { NextResponse } from "next/server";

import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeUuidSchema } from "@/lib/validations/devotee";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsed = devoteeUuidSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const profile = await fetchDevoteeProfile(parsed.data);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
