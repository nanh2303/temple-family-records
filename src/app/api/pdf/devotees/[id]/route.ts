import { NextResponse } from "next/server";

import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";
import { fillMauGiaPhaPdf } from "@/lib/pdf/fillMauGiaPha";
import { MAU_GIA_PHA_TEMPLATE_FILENAME } from "@/lib/pdf/pdfFieldMap";
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

  const bytes = await fillMauGiaPhaPdf(profile);
  const filename = `${MAU_GIA_PHA_TEMPLATE_FILENAME.replace(".pdf", "")}-${profile.devotee.id}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
