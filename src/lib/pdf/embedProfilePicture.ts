import type { PDFDocument } from "pdf-lib";

type EmbedResult = { image: Awaited<ReturnType<PDFDocument["embedJpg"]>> } | null;

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isWebp(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

/**
 * Embed profile picture bytes into a PDF document (JPEG, PNG, or WebP).
 */
export async function embedProfilePictureImage(pdf: PDFDocument, imageBytes: Uint8Array): Promise<EmbedResult> {
  if (isJpeg(imageBytes)) {
    return { image: await pdf.embedJpg(imageBytes) };
  }

  if (isPng(imageBytes)) {
    return { image: await pdf.embedPng(imageBytes) };
  }

  if (isWebp(imageBytes)) {
    const sharp = (await import("sharp")).default;
    const jpegBytes = await sharp(imageBytes).jpeg({ quality: 90 }).toBuffer();
    return { image: await pdf.embedJpg(jpegBytes) };
  }

  return null;
}

export function describeImageFormat(bytes: Uint8Array): string {
  if (isJpeg(bytes)) return "jpeg";
  if (isPng(bytes)) return "png";
  if (isWebp(bytes)) return "webp";
  return "unknown";
}
