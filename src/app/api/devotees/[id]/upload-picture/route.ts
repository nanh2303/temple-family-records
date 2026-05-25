// File: src/app/api/devotees/[id]/upload-picture/route.ts

import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeUuidSchema } from "@/lib/validations/devotee";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const STORAGE_BUCKET = "devotee-profiles";

function isAllowedMimeType(mimeType: string): boolean {
  return mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp";
}

function extractFilePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
    if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
      return pathParts.slice(bucketIndex + 1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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
    return NextResponse.json({ error: "Invalid devotee id" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const { data: existingDevotee, error: existingError } = await supabase
      .from("devotees")
      .select("id, profile_picture_url")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking devotee existence:", existingError);
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (!existingDevotee) {
      return NextResponse.json({ error: "Devotee not found" }, { status: 404 });
    }

    if (existingDevotee.profile_picture_url) {
      const oldFilePath = extractFilePath(existingDevotee.profile_picture_url);
      if (oldFilePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([oldFilePath]);
      }
    }

    const fileExtension = file.name.split(".").pop() ?? "jpg";
    const fileName = `${parsedId.data}-${Date.now()}.${fileExtension}`;
    const filePath = `${parsedId.data}/${fileName}`;

    const buffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);

    const { error: updateError } = await supabase
      .from("devotees")
      .update({ profile_picture_url: publicUrl })
      .eq("id", parsedId.data);

    if (updateError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);

      console.error("RLS Policy Error Details:", {
        error: updateError.message,
        code: updateError.code,
        details: updateError.details,
        devoteeId: parsedId.data,
      });

      if (updateError.message.includes("row-level security") || updateError.code === "PGRST100") {
        return NextResponse.json(
          { error: "Database permission denied. Please ensure RLS policies are properly configured." },
          { status: 403 },
        );
      }

      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl, path: uploadData.path }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "File upload failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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
    return NextResponse.json({ error: "Invalid devotee id" }, { status: 400 });
  }

  try {
    const { data: devotee, error: selectError } = await supabase
      .from("devotees")
      .select("profile_picture_url")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    if (!devotee || !devotee.profile_picture_url) {
      return NextResponse.json({ error: "No profile picture to delete" }, { status: 404 });
    }

    const filePath = extractFilePath(devotee.profile_picture_url);
    if (filePath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    }

    const { error: updateError } = await supabase
      .from("devotees")
      .update({ profile_picture_url: null })
      .eq("id", parsedId.data);

    if (updateError) {
      console.error("RLS Policy Error Details on DELETE:", {
        error: updateError.message,
        code: updateError.code,
        details: updateError.details,
        devoteeId: parsedId.data,
      });

      if (updateError.message.includes("row-level security") || updateError.code === "PGRST100") {
        return NextResponse.json(
          { error: "Database permission denied. Please ensure RLS policies are properly configured." },
          { status: 403 },
        );
      }

      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete operation failed" },
      { status: 500 },
    );
  }
}