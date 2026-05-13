import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeCreateSchema } from "@/lib/validations/devotee";

function validationMessage(error: ZodError) {
  return error.issues.map((issue) => issue.message).join(" ");
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authenticated users are treated as admins in this app. Add role-claim checks here before adding non-admin users.
  const body = await request.json().catch(() => null);
  const parsed = devoteeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
  }

  const { data: devotee, error } = await supabase.from("devotees").insert(parsed.data).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ devotee, id: devotee.id }, { status: 201 });
}
