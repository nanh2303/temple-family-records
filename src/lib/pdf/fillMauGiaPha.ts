import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DevoteeProfileBundle } from "@/types/devotee";

import { MAU_GIA_PHA_ACROFORM_FIELDS, MAU_GIA_PHA_STAMP_COORDINATES, MAU_GIA_PHA_TEMPLATE_FILENAME } from "./pdfFieldMap";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "templates", MAU_GIA_PHA_TEMPLATE_FILENAME);
const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return value;
}
async function embedVietnameseFont(pdf: PDFDocument) {
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile(FONT_PATH);
  return pdf.embedFont(fontBytes, { subset: true });
}
function getStampValues(profile: DevoteeProfileBundle): Record<string, string> {
  const { devotee, afterlife } = profile;

  return {
    familyRegistryNo: devotee.family_registry_no ?? "",
    bhdRegistryNo: devotee.bhd_registry_no ?? "",
    fullName: devotee.full_name ?? "",
    birthDate: formatDate(devotee.birth_date),
    birthPlace: devotee.birth_place ?? "",
    dharmaName: devotee.dharma_name ?? "",
    address: devotee.address ?? "",
    joinedUnitDate: formatDate(devotee.joined_unit_date),
    vowDate: formatDate(devotee.vow_date),
    refugeDate: formatDate(devotee.refuge_date),
    preceptor: devotee.preceptor ?? "",
    fatherName: devotee.father_name ?? "",
    motherName: devotee.mother_name ?? "",
    deathDate: formatDate(afterlife?.death_date ?? null),
    graveLocation: afterlife?.grave_location ?? "",
  };
}
/**
 * Loads the official template when present, maps `DevoteeProfileBundle` into fields or stamps,
 * and returns PDF bytes.
 *
 * TODO: Complete AcroForm mapping using real field names from `pdfFieldMap.ts`, or replace
 * the coordinate fallback with calibrated positions for each section of Mau Gia Pha So 05.
 */
export async function fillMauGiaPhaPdf(profile: DevoteeProfileBundle): Promise<Uint8Array> {
  const { devotee, afterlife } = profile;
  let templateBytes: Uint8Array | null = null;

  try {
    templateBytes = await readFile(TEMPLATE_PATH);
    console.log("Loaded MauGiaPha template:", TEMPLATE_PATH, templateBytes.length);
  } catch (error) {
    console.error("Could not read MauGiaPha template:", TEMPLATE_PATH, error);
    templateBytes = null;
  }

  if (!templateBytes) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const font = await embedVietnameseFont(doc);
    page.drawText("Temple family records — PDF template missing.", {
      x: 48,
      y: 780,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Add the file at public/templates/${MAU_GIA_PHA_TEMPLATE_FILENAME}`, {
      x: 48,
      y: 756,
      size: 10,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
    page.drawText(`Devotee: ${devotee.full_name}`, { x: 48, y: 720, size: 11, font });
    return doc.save();
  }

  try {
    const pdf = await PDFDocument.load(templateBytes);
    const form = pdf.getForm();
    const fields = MAU_GIA_PHA_ACROFORM_FIELDS;

    const trySet = (pdfFieldName: string, value: string) => {
      if (!value || pdfFieldName.startsWith("TODO_")) return;
      try {
        const field = form.getTextField(pdfFieldName);
        field.setText(value);
      } catch {
        // Field missing or wrong type — stamping path will handle later.
      }
    };

    trySet(fields.familyRegistryNo, devotee.family_registry_no ?? "");
    trySet(fields.bhdRegistryNo, devotee.bhd_registry_no ?? "");
    trySet(fields.fullName, devotee.full_name);
    trySet(fields.birthDate, formatDate(devotee.birth_date));
    trySet(fields.birthPlace, devotee.birth_place ?? "");
    trySet(fields.dharmaName, devotee.dharma_name ?? "");
    trySet(fields.address, devotee.address ?? "");
    trySet(fields.joinedUnitDate, formatDate(devotee.joined_unit_date));
    trySet(fields.vowDate, formatDate(devotee.vow_date));
    trySet(fields.refugeDate, formatDate(devotee.refuge_date));
    trySet(fields.preceptor, devotee.preceptor ?? "");
    trySet(fields.fatherName, devotee.father_name ?? "");
    trySet(fields.motherName, devotee.mother_name ?? "");
    trySet(fields.deathDate, formatDate(afterlife?.death_date ?? null));
    trySet(fields.graveLocation, afterlife?.grave_location ?? "");

    const font = await embedVietnameseFont(pdf);
    const pages = pdf.getPages();
    const stampValues = getStampValues(profile);

    for (const [fieldKey, stamp] of Object.entries(MAU_GIA_PHA_STAMP_COORDINATES)) {
      const value = stampValues[fieldKey];

      if (!stamp || !value) continue;

      const page = pages[stamp.pageIndex];
      if (!page) continue;

      page.drawText(value, {
        x: stamp.x,
        y: stamp.y,
        size: stamp.fontSize ?? 9,
        font,
        color: rgb(0, 0, 0),
      });
    }

    return pdf.save({ useObjectStreams: false });
  } catch (error) {
    console.error("Failed to fill MauGiaPha PDF:", error);

    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const font = await embedVietnameseFont(doc);
    page.drawText("Unable to load or modify the PDF template (see server logs).", {
      x: 48,
      y: 780,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Devotee: ${devotee.full_name}`, { x: 48, y: 756, size: 11, font });
    return doc.save();
  }
}
