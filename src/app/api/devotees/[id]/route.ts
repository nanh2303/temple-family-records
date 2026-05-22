import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  extractAfterlifeFromPatch,
  extractDevoteeCorePatch,
  extractRelatedRecordsFromPatch,
  hasAfterlifeContent,
  saveDevoteeProfileRelatedRecords,
  upsertDevoteeAfterlife,
} from "@/lib/data/devotee-afterlife";
import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeProfileUpdateSchema, devoteeUuidSchema } from "@/lib/validations/devotee";

type RouteContext = { params: Promise<{ id: string }> };

const WRITE_POLICY_ERROR =
  "Devotee exists, but the database blocked this write. Apply the latest Supabase CRUD policies/grants migration.";

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
  const parsed = devoteeProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: validationMessage(parsed.error) }, { status: 400 });
  }

  const devoteePatch = extractDevoteeCorePatch(parsed.data);
  const afterlifePatch = extractAfterlifeFromPatch(parsed.data);
  const relatedPatch = extractRelatedRecordsFromPatch(parsed.data);

  const { data: existingDevotee, error: existingError } = await supabase
    .from("devotees")
    .select("id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existingDevotee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let devotee = existingDevotee;

  if (Object.keys(devoteePatch).length > 0) {
    const { data: updatedDevotee, error } = await supabase
      .from("devotees")
      .update(devoteePatch)
      .eq("id", parsedId.data)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedDevotee) {
      return NextResponse.json({ error: WRITE_POLICY_ERROR }, { status: 403 });
    }

    devotee = updatedDevotee;
  } else {
    const { data: currentDevotee, error } = await supabase
      .from("devotees")
      .select("*")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!currentDevotee) {
      return NextResponse.json({ error: WRITE_POLICY_ERROR }, { status: 403 });
    }

    devotee = currentDevotee;
  }

  if (afterlifePatch !== undefined) {
    try {
      await upsertDevoteeAfterlife(
        supabase,
        parsedId.data,
        hasAfterlifeContent(afterlifePatch) ? afterlifePatch : null,
      );
    } catch (afterlifeError) {
      return NextResponse.json(
        { error: afterlifeError instanceof Error ? afterlifeError.message : "Failed to save afterlife info." },
        { status: 500 },
      );
    }
  }

  try {
    await saveDevoteeProfileRelatedRecords(supabase, parsedId.data, relatedPatch);
  } catch (relatedError) {
    return NextResponse.json(
      { error: relatedError instanceof Error ? relatedError.message : "Failed to save profile details." },
      { status: 500 },
    );
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

  const { data: existingDevotee, error: existingError } = await supabase
    .from("devotees")
    .select("id")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existingDevotee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authenticated users are treated as admins in this app. Add role-claim checks here before adding non-admin users.
  const { data, error } = await supabase.from("devotees").delete().eq("id", parsedId.data).select("id").maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: WRITE_POLICY_ERROR }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
