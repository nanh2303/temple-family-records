import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DevoteeProfileBundle } from "@/types/devotee";

import { fitSingleLineText } from "./fitPdfText";
import { collectPdfStampText, preparePdfText } from "./preparePdfText";
import {
  MAU_GIA_PHA_STAMP_ANCHORS,
  MAU_GIA_PHA_TEMPLATE_FILENAME,
  type MauGiaPhaFieldKey,
  type MauGiaPhaStampAnchor,
} from "./pdfFieldMap";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "templates", MAU_GIA_PHA_TEMPLATE_FILENAME);
const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");

const DEFAULT_STAMP_FONT_SIZE = 10;

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return preparePdfText(value);
}

async function embedVietnameseFont(pdf: PDFDocument, stampText: string) {
  pdf.registerFontkit(fontkit);
  const fontBytes = await readFile(FONT_PATH);
  // Subsetting via @pdf-lib/fontkit often drops Vietnamese glyphs in viewers; embed full font.
  const font = await pdf.embedFont(fontBytes, { subset: false });

  if (stampText) {
    font.encodeText(stampText);
  }

  return font;
}

function getStampValues(profile: DevoteeProfileBundle): Record<MauGiaPhaFieldKey, string> {
  const { devotee, afterlife } = profile;

  return {
    familyRegistryNo: preparePdfText(devotee.family_registry_no),
    bhdRegistryNo: preparePdfText(devotee.bhd_registry_no),
    fullName: preparePdfText(devotee.full_name),
    birthDate: formatDate(devotee.birth_date),
    birthPlace: preparePdfText(devotee.birth_place),
    dharmaName: preparePdfText(devotee.dharma_name),
    address: preparePdfText(devotee.address),
    joinedUnitDate: formatDate(devotee.joined_unit_date),
    vowDate: formatDate(devotee.vow_date),
    refugeDate: formatDate(devotee.refuge_date),
    preceptor: preparePdfText(devotee.preceptor),
    fatherName: preparePdfText(devotee.father_name),
    motherName: preparePdfText(devotee.mother_name),
    deathDate: formatDate(afterlife?.death_date ?? null),
    graveLocation: preparePdfText(afterlife?.grave_location),
  };
}

function stampField(
  page: PDFPage,
  font: PDFFont,
  anchor: MauGiaPhaStampAnchor,
  value: string,
) {
  if (!value) return;

  const fontSize = anchor.fontSize ?? DEFAULT_STAMP_FONT_SIZE;
  const lineText = anchor.maxWidth
    ? fitSingleLineText(value, font, fontSize, anchor.maxWidth)
    : value;

  page.drawText(lineText, {
    x: anchor.x,
    y: anchor.y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}

/**
 * Loads the official static template and stamps devotee data onto each blank line.
 */
export async function fillMauGiaPhaPdf(profile: DevoteeProfileBundle): Promise<Uint8Array> {
  const { devotee } = profile;
  let templateBytes: Uint8Array | null = null;

  try {
    templateBytes = await readFile(TEMPLATE_PATH);
  } catch (error) {
    console.error("Could not read MauGiaPha template:", TEMPLATE_PATH, error);
    templateBytes = null;
  }

  if (!templateBytes) {
    const doc = await PDFDocument.create();
    const stampText = preparePdfText(devotee.full_name);
    const font = await embedVietnameseFont(doc, stampText);
    const page = doc.addPage([595.28, 841.89]);
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
    page.drawText(`Devotee: ${stampText}`, { x: 48, y: 720, size: 11, font });
    return doc.save();
  }

  try {
    const pdf = await PDFDocument.load(templateBytes);
    const stampValues = getStampValues(profile);
    const font = await embedVietnameseFont(pdf, collectPdfStampText(Object.values(stampValues)));
    const pages = pdf.getPages();

    for (const [fieldKey, anchor] of Object.entries(MAU_GIA_PHA_STAMP_ANCHORS) as [
      MauGiaPhaFieldKey,
      MauGiaPhaStampAnchor,
    ][]) {
      const value = stampValues[fieldKey];
      const page = pages[anchor.pageIndex];
      if (!page || !value) continue;

      stampField(page, font, anchor, value);
    }

    return pdf.save({ useObjectStreams: false });
  } catch (error) {
    console.error("Failed to fill MauGiaPha PDF:", error);

    const doc = await PDFDocument.create();
    const stampText = preparePdfText(devotee.full_name);
    const font = await embedVietnameseFont(doc, stampText);
    const page = doc.addPage([595.28, 841.89]);
    page.drawText("Unable to load or modify the PDF template (see server logs).", {
      x: 48,
      y: 780,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`Devotee: ${stampText}`, { x: 48, y: 756, size: 11, font });
    return doc.save();
  }
}
