import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DevoteeProfileBundle } from "@/types/devotee";

import { MAU_GIA_PHA_ACROFORM_FIELDS, MAU_GIA_PHA_STAMP_COORDINATES, MAU_GIA_PHA_TEMPLATE_FILENAME } from "./pdfFieldMap";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "templates", MAU_GIA_PHA_TEMPLATE_FILENAME);

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return value;
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
  } catch {
    templateBytes = null;
  }

  if (!templateBytes) {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
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

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const stamp = MAU_GIA_PHA_STAMP_COORDINATES.fullName;
    if (stamp && devotee.full_name) {
      const page = pdf.getPages()[stamp.pageIndex];
      if (page) {
        page.drawText(devotee.full_name, {
          x: stamp.x,
          y: stamp.y,
          size: stamp.fontSize ?? 11,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }

    return pdf.save({ useObjectStreams: false });
  } catch {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
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
