import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeUuidSchema } from "@/lib/validations/devotee";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STORAGE_BUCKET = "devotee-profiles";
const STORAGE_FILE_SIZE_LIMIT = "5MB";

type RouteContext = { params: Promise<{ id: string }> };

type AdminSupabaseClient = ReturnType<typeof createAdminSupabaseClient>;

async function ensureProfilePictureBucket(supabase: AdminSupabaseClient) {
  const { data: bucket, error } = await supabase.storage.getBucket(STORAGE_BUCKET);

  if (!bucket) {
    const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      fileSizeLimit: STORAGE_FILE_SIZE_LIMIT,
    });

    if (createError) {
      throw new Error(createError.message);
    }
    return;
  }

  if (error && !error.message.toLowerCase().includes("not found")) {
    throw new Error(error.message);
  }

  if (!bucket.public) {
    const { error: updateError } = await supabase.storage.updateBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      fileSizeLimit: STORAGE_FILE_SIZE_LIMIT,
    });

    if (updateError) {
      throw new Error(updateError.message);
    }
  }
}

export async function POST(request: Request, context: RouteContext) {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

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

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
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

    const supabase = createAdminSupabaseClient();
    await ensureProfilePictureBucket(supabase);

    // Check if devotee exists
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

    // Delete old profile picture if it exists
    if (existingDevotee.profile_picture_url) {
      const oldFilePath = extractFilePath(existingDevotee.profile_picture_url);
      if (oldFilePath) {
        await supabase.storage.from(STORAGE_BUCKET).remove([oldFilePath]);
      }
    }

    // Upload new file
    const fileExtension = file.name.split(".").pop() || "jpg";
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

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadData.path);

    // Update devotee record with new profile picture URL
    const { error: updateError } = await supabase
      .from("devotees")
      .update({ profile_picture_url: publicUrl })
      .eq("id", parsedId.data);

    if (updateError) {
      // Clean up uploaded file if update fails
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
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

export async function DELETE(_request: Request, context: RouteContext) {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const parsedId = devoteeUuidSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid devotee id" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    // Get current profile picture
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

    // Delete from storage
    const filePath = extractFilePath(devotee.profile_picture_url);
    if (filePath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
    }

    // Update devotee record
    const { error: updateError } = await supabase
      .from("devotees")
      .update({ profile_picture_url: null })
      .eq("id", parsedId.data);

    if (updateError) {
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

function extractFilePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/");
    // Extract path after /object/public/bucket-name/
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET);
    if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
      return pathParts.slice(bucketIndex + 1).join("/");
    }
    return null;
  } catch {
    return null;
  }
}
