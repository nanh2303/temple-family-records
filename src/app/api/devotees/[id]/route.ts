import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeUpdateSchema, devoteeUuidSchema } from "@/lib/validations/devotee";

type RouteContext = { params: Promise<{ id: string }> };

function validationMessage(error: ZodError) {
  return error.issues.map((issue) => issue.message).join(" ");
}

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

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = devoteeUuidSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Authenticated users are treated as admins in this app. Add role-claim checks here before adding non-admin users.
  const body = await request.json().catch(() => null);
  const parsed = devoteeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
  }

  const { data: devotee, error } = await supabase
    .from("devotees")
    .update(parsed.data)
    .eq("id", parsedId.data)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!devotee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ devotee });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = devoteeUuidSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  // Authenticated users are treated as admins in this app. Add role-claim checks here before adding non-admin users.
  const { data, error } = await supabase.from("devotees").delete().eq("id", parsedId.data).select("id").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
