import { NextResponse } from "next/server";

import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";
import { fillMauGiaPhaPdf } from "@/lib/pdf/fillMauGiaPha";
import { DEFAULT_FORM_TEMPLATE_ID, getFormTemplateDefinition, isFormTemplateId } from "@/lib/pdf/formTemplates";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { devoteeUuidSchema } from "@/lib/validations/devotee";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
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

  const { searchParams } = new URL(request.url);
  const requestedTemplate = searchParams.get("template") ?? DEFAULT_FORM_TEMPLATE_ID;
  if (!isFormTemplateId(requestedTemplate)) {
    return NextResponse.json({ error: "Unknown PDF template" }, { status: 400 });
  }

  const profile = await fetchDevoteeProfile(parsed.data);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const template = getFormTemplateDefinition(requestedTemplate);
  if (!template) {
    return NextResponse.json({ error: "Unknown PDF template" }, { status: 400 });
  }

  let bytes: Uint8Array;
  try {
    switch (requestedTemplate) {
      case "mau-gia-pha-05":
        bytes = await fillMauGiaPhaPdf(profile);
        break;
    }
  } catch (error) {
    console.error("Failed to generate devotee PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }

  const filename = `${template.templateFileName.replace(/\.pdf$/i, "")}-${profile.devotee.id}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
