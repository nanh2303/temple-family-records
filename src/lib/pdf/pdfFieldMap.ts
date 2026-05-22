/**
 * Coordinate map for Mau Gia Pha So 05 (static PDF — no AcroForm fields).
 *
 * Positions were taken from dotted-line anchors in
 * `public/templates/5.-MauGiaPha-So-05.BHDTU-PDF.pdf` via `node scripts/inspect-pdf-template.mjs`.
 * Origin: bottom-left PDF user space (612×792 pt, US Letter).
 */

export const MAU_GIA_PHA_TEMPLATE_FILENAME = "5.-MauGiaPha-So-05.BHDTU-PDF.pdf" as const;

export type MauGiaPhaFieldKey =
  | "familyRegistryNo"
  | "bhdRegistryNo"
  | "fullName"
  | "birthDate"
  | "birthPlace"
  | "dharmaName"
  | "address"
  | "joinedUnitDate"
  | "vowDate"
  | "refugeDate"
  | "preceptor"
  | "fatherName"
  | "motherName"
  | "deathDate"
  | "graveLocation";

export type MauGiaPhaStampAnchor = {
  pageIndex: number;
  /** Baseline x where the dotted fill line begins (after the label colon). */
  x: number;
  /** Text baseline y (matches label/dotted-line y in the template). */
  y: number;
  fontSize?: number;
  /** Clip long values to the blank line width. */
  maxWidth?: number;
};

/**
 * Stamping anchors aligned to each blank line on the official template.
 */
export const MAU_GIA_PHA_STAMP_ANCHORS: Record<MauGiaPhaFieldKey, MauGiaPhaStampAnchor> = {
  familyRegistryNo: { pageIndex: 0, x: 241, y: 737.2, fontSize: 10, maxWidth: 110 },
  bhdRegistryNo: { pageIndex: 0, x: 464.3, y: 737.2, fontSize: 10, maxWidth: 130 },

  fullName: { pageIndex: 0, x: 224.3, y: 695.7, fontSize: 10, maxWidth: 370 },
  birthDate: { pageIndex: 0, x: 222, y: 680, fontSize: 10, maxWidth: 370 },
  birthPlace: { pageIndex: 0, x: 224.3, y: 664.3, fontSize: 10, maxWidth: 370 },
  dharmaName: { pageIndex: 0, x: 224.3, y: 648.6, fontSize: 10, maxWidth: 370 },
  address: { pageIndex: 0, x: 224.3, y: 632.9, fontSize: 10, maxWidth: 370 },
  joinedUnitDate: { pageIndex: 0, x: 224.3, y: 617.3, fontSize: 10, maxWidth: 370 },
  vowDate: { pageIndex: 0, x: 224.3, y: 601.6, fontSize: 10, maxWidth: 370 },
  refugeDate: { pageIndex: 0, x: 224.3, y: 585.9, fontSize: 10, maxWidth: 370 },
  preceptor: { pageIndex: 0, x: 224.3, y: 570.2, fontSize: 10, maxWidth: 370 },
  fatherName: { pageIndex: 0, x: 224.3, y: 554.5, fontSize: 10, maxWidth: 370 },
  motherName: { pageIndex: 0, x: 224.3, y: 538.9, fontSize: 10, maxWidth: 370 },

  /** Page 2 — section I. HẬU THẾ (same x as other colon fields on the form). */
  deathDate: { pageIndex: 1, x: 224.3, y: 116.1, fontSize: 10, maxWidth: 370 },
  graveLocation: { pageIndex: 1, x: 224.3, y: 100.4, fontSize: 10, maxWidth: 370 },
};
