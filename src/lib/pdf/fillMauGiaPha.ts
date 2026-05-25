// File: src/lib/pdf/fillMauGiaPha.ts

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  getTrainingRecordDefinitionForRecord,
  type DevoteeTrainingRecordKey,
} from "@/lib/devotees/profile-sections";
import type { DevoteeProfileBundle } from "@/types/devotee";

import { fitSingleLineText } from "./fitPdfText";
import { collectPdfStampText, preparePdfText } from "./preparePdfText";
import {
  MAU_GIA_PHA_STAMP_ANCHORS,
  MAU_GIA_PHA_LINE_SECTIONS,
  MAU_GIA_PHA_TRAINING_ANCHORS,
  MAU_GIA_PHA_TEMPLATE_FILENAME,
  MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR,
  type MauGiaPhaLineSection,
  type MauGiaPhaFieldKey,
  type MauGiaPhaStampAnchor,
} from "./pdfFieldMap";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "templates", MAU_GIA_PHA_TEMPLATE_FILENAME);
const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");

const DEFAULT_STAMP_FONT_SIZE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Fetch image bytes from an absolute URL.
 * Returns `null` on any network or HTTP error so callers can skip gracefully.
 */
async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? "";
    return { bytes: new Uint8Array(buffer), contentType };
  } catch (error) {
    console.error("Failed to fetch profile picture:", url, error);
    return null;
  }
}

/**
 * Detect image type from magic bytes, falling back to the Content-Type header
 * (or the URL file extension as a last resort).
 *
 * Returns `"jpeg"`, `"png"`, or `null` (unsupported — e.g. WebP).
 *
 * Note: pdf-lib only supports JPEG and PNG.  WebP is not embeddable without
 * a conversion step.  Images uploaded after the client-side resize are always
 * JPEG so they will always embed successfully.
 */
function detectImageType(bytes: Uint8Array, contentType: string, url: string): "jpeg" | "png" | null {
  // Magic bytes take priority — they are authoritative regardless of headers.
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";

  // Fall back to Content-Type header.
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpeg";
  if (contentType.includes("png")) return "png";

  // Last resort: URL extension.
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "jpeg";
  if (ext === "png") return "png";

  // WebP / unknown — pdf-lib cannot embed these.
  return null;
}

// ---------------------------------------------------------------------------
// Stamp value builders
// ---------------------------------------------------------------------------

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

function getTrainingStampValues(profile: DevoteeProfileBundle) {
  const values = new Map<DevoteeTrainingRecordKey, { completedDate: string; decisionNo: string }>();

  for (const record of profile.training) {
    const definition = getTrainingRecordDefinitionForRecord(record);
    if (!definition) continue;

    values.set(definition.key, {
      completedDate: formatDate(record.completed_date),
      decisionNo: preparePdfText(record.decision_no),
    });
  }

  return values;
}

function compactParts(parts: (string | null | undefined)[]) {
  return parts.map(preparePdfText).filter(Boolean).join(" - ");
}

function getLineSectionValues(profile: DevoteeProfileBundle) {
  const roles = profile.roles.map((role) =>
    compactParts([
      role.role_title,
      role.organization,
      compactParts([role.start_date, role.end_date]),
      role.note,
    ]),
  );
  const achievements = profile.notes.filter((note) => note.note_type === "achievement").map((note) => note.content);
  const comments = profile.notes
    .filter((note) => note.note_type === "comment" || note.note_type === "other")
    .map((note) => note.content);

  return { roles, achievements, comments };
}

// ---------------------------------------------------------------------------
// Draw helpers
// ---------------------------------------------------------------------------

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

function stampLineSection(
  pages: PDFPage[],
  font: PDFFont,
  section: MauGiaPhaLineSection,
  values: string[],
) {
  const page = pages[section.pageIndex];
  if (!page) return;

  const fontSize = section.fontSize ?? DEFAULT_STAMP_FONT_SIZE;
  values.slice(0, section.maxLines).forEach((value, index) => {
    const prepared = preparePdfText(value);
    if (!prepared) return;

    page.drawText(fitSingleLineText(prepared, font, fontSize, section.maxWidth), {
      x: section.x,
      y: section.firstY - section.lineHeight * index,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });
}

/**
 * Embed the devotee's profile picture into `pdf` at the designated anchor position.
 *
 * Silently skips if:
 *  - the URL is absent or the image cannot be fetched,
 *  - the format is not JPEG or PNG (e.g. legacy WebP uploads),
 *  - any other embedding error occurs.
 *
 * All new uploads are resized to JPEG on the client before upload, so they
 * will always embed successfully.
 */
async function embedProfilePicture(pdf: PDFDocument, pages: PDFPage[], profilePictureUrl: string): Promise<void> {
  const result = await fetchImageBytes(profilePictureUrl);
  if (!result) return;

  const { bytes: imageBytes, contentType } = result;
  const imageType = detectImageType(imageBytes, contentType, profilePictureUrl);

  if (!imageType) {
    // WebP or unknown — pdf-lib cannot embed; skip silently.
    console.warn(
      "Profile picture skipped in PDF: unsupported format (not JPEG or PNG).",
      profilePictureUrl,
    );
    return;
  }

  try {
    const anchor = MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR;
    const page = pages[anchor.pageIndex];
    if (!page) return;

    const image =
      imageType === "jpeg"
        ? await pdf.embedJpg(imageBytes)
        : await pdf.embedPng(imageBytes);

    // Scale the image to fit the anchor box while preserving aspect ratio.
    const { width: imgW, height: imgH } = image.size();
    const scale = Math.min(anchor.width / imgW, anchor.height / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    // Centre within the anchor box.
    const offsetX = (anchor.width - drawW) / 2;
    const offsetY = (anchor.height - drawH) / 2;

    page.drawImage(image, {
      x: anchor.x + offsetX,
      y: anchor.y + offsetY,
      width: drawW,
      height: drawH,
    });
  } catch (imageError) {
    console.error("Failed to embed profile picture in PDF:", imageError);
    // Non-fatal — continue generating the rest of the PDF.
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Loads the official static template and stamps devotee data onto each blank line.
 * Also embeds the devotee's profile picture into the designated photo box.
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

  // --- Fallback: no template ---
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

  // --- Normal path ---
  try {
    const pdf = await PDFDocument.load(templateBytes);
    const stampValues = getStampValues(profile);
    const trainingStampValues = getTrainingStampValues(profile);
    const lineSectionValues = getLineSectionValues(profile);

    const font = await embedVietnameseFont(
      pdf,
      collectPdfStampText([
        ...Object.values(stampValues),
        ...[...trainingStampValues.values()].flatMap((v) => [v.completedDate, v.decisionNo]),
        ...lineSectionValues.roles,
        ...lineSectionValues.achievements,
        ...lineSectionValues.comments,
      ]),
    );

    const pages = pdf.getPages();

    // --- Embed profile picture ---
    if (devotee.profile_picture_url) {
      await embedProfilePicture(pdf, pages, devotee.profile_picture_url);
    }

    // --- Stamp text fields ---
    for (const [fieldKey, anchor] of Object.entries(MAU_GIA_PHA_STAMP_ANCHORS) as [
      MauGiaPhaFieldKey,
      MauGiaPhaStampAnchor,
    ][]) {
      const value = stampValues[fieldKey];
      const page = pages[anchor.pageIndex];
      if (!page || !value) continue;
      stampField(page, font, anchor, value);
    }

    // --- Stamp training records ---
    for (const [key, values] of trainingStampValues.entries()) {
      const anchors = MAU_GIA_PHA_TRAINING_ANCHORS[key];
      const completedDatePage = pages[anchors.completedDate.pageIndex];
      const decisionNoPage = pages[anchors.decisionNo.pageIndex];

      if (completedDatePage) {
        stampField(completedDatePage, font, anchors.completedDate, values.completedDate);
      }
      if (decisionNoPage) {
        stampField(decisionNoPage, font, anchors.decisionNo, values.decisionNo);
      }
    }

    // --- Stamp line sections ---
    stampLineSection(pages, font, MAU_GIA_PHA_LINE_SECTIONS.roles, lineSectionValues.roles);
    stampLineSection(pages, font, MAU_GIA_PHA_LINE_SECTIONS.achievements, lineSectionValues.achievements);
    stampLineSection(pages, font, MAU_GIA_PHA_LINE_SECTIONS.comments, lineSectionValues.comments);

    return pdf.save({ useObjectStreams: false });
  } catch (error) {
    console.error("Failed to fill MauGiaPha PDF:", error);

    // Graceful fallback page.
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
