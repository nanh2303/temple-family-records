import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { splitDevoteeProfilePayload, upsertDevoteeAfterlife } from "@/lib/data/devotee-afterlife";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeProfileCreateSchema } from "@/lib/validations/devotee";

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
  const parsed = devoteeProfileCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
  }

  const { devotee: devoteeInput, afterlife } = splitDevoteeProfilePayload(parsed.data);
  const { data: devotee, error } = await supabase.from("devotees").insert(devoteeInput).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    if (afterlife) {
      await upsertDevoteeAfterlife(supabase, devotee.id, afterlife);
    }
  } catch (afterlifeError) {
    await supabase.from("devotees").delete().eq("id", devotee.id);
    return NextResponse.json(
      { error: afterlifeError instanceof Error ? afterlifeError.message : "Failed to save afterlife info." },
      { status: 500 },
    );
  }

  return NextResponse.json({ devotee, id: devotee.id }, { status: 201 });
}
