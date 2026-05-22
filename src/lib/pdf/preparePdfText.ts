/**
 * Prepare user-facing text for PDF output (Vietnamese-safe).
 */

const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF\u00AD]/g;

/**
 * Normalize to composed Unicode (NFC) so Vietnamese diacritics render as single glyphs.
 * Strips zero-width / BOM characters that break layout or subsetting.
 */
export function preparePdfText(value: string | null | undefined): string {
  if (!value) return "";
  return value.normalize("NFC").replace(INVISIBLE_CHARS, "").trim();
}

/**
 * Collect every string that will be stamped so subset fonts include all glyphs up front.
 */
export function collectPdfStampText(values: Iterable<string>): string {
  return [...values].map(preparePdfText).filter(Boolean).join("\n");
}
