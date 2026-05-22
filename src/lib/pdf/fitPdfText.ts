import type { PDFFont } from "pdf-lib";

const ELLIPSIS = "…";

/**
 * Truncate to one line without splitting Vietnamese grapheme clusters.
 */
export function fitSingleLineText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string {
  if (!text || maxWidth <= 0) return text;
  if (font.widthOfTextAtSize(text, fontSize) <= maxWidth) return text;

  const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
  const graphemes = [...segmenter.segment(text)].map((part) => part.segment);

  let line = "";
  for (const grapheme of graphemes) {
    const candidate = line + grapheme;
    const withEllipsis = candidate + ELLIPSIS;
    if (font.widthOfTextAtSize(withEllipsis, fontSize) > maxWidth) break;
    line = candidate;
  }

  if (!line) {
    return graphemes[0] ?? text;
  }

  if (line.length < text.length) {
    return line + ELLIPSIS;
  }

  return line;
}
