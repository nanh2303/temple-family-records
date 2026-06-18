import type { DevoteeTrainingRecordKey } from "@/lib/devotees/profile-sections";

/**
 * Coordinate map for Mau Gia Pha So 05 (static PDF, no AcroForm fields).
 *
 * Positions were taken from dotted-line anchors in
 * `public/templates/5.-MauGiaPha-So-05.BHDTU-PDF.pdf` via pdfjs text extraction.
 * Origin: bottom-left PDF user space (612x792 pt, US Letter).
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
  /** Baseline x where the blank line starts. */
  x: number;
  /** Text baseline y. */
  y: number;
  fontSize?: number;
  /** Clip long values to the blank line width. */
  maxWidth?: number;
};

export type MauGiaPhaImageAnchor = {
  pageIndex: number;
  /** Bottom-left x coordinate. */
  x: number;
  /** Bottom-left y coordinate. */
  y: number;
  /** Image width in PDF points. */
  width: number;
  /** Image height in PDF points. */
  height: number;
};

/**
 * Profile photo box on PHẦN LÝ LỊCH — right column (measured from template constructPath).
 * Rectangle corners: (482.4, 635.76) → (540, 707.76) in PDF user space.
 */
export const MAU_GIA_PHA_PROFILE_PICTURE_ANCHOR: MauGiaPhaImageAnchor = {
  pageIndex: 0,
  x: 482.4,
  y: 635.76,
  width: 57.6,
  height: 72,
};

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

  deathDate: { pageIndex: 1, x: 177, y: 116.1, fontSize: 10, maxWidth: 370 },
  graveLocation: { pageIndex: 1, x: 177, y: 100.4, fontSize: 10, maxWidth: 370 },
};

export const MAU_GIA_PHA_TRAINING_ANCHORS: Record<
  DevoteeTrainingRecordKey,
  { completedDate: MauGiaPhaStampAnchor; decisionNo: MauGiaPhaStampAnchor }
> = {
  long_term_mo_mat: {
    completedDate: { pageIndex: 0, x: 260.3, y: 464.7, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 464.7, fontSize: 9, maxWidth: 110 },
  },
  long_term_canh_mem: {
    completedDate: { pageIndex: 0, x: 260.3, y: 449, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 449, fontSize: 9, maxWidth: 110 },
  },
  long_term_chan_cung: {
    completedDate: { pageIndex: 0, x: 260.3, y: 433.3, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 433.3, fontSize: 9, maxWidth: 110 },
  },
  long_term_tung_bay: {
    completedDate: { pageIndex: 0, x: 260.3, y: 417.7, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 417.7, fontSize: 9, maxWidth: 110 },
  },
  long_term_huong_thien: {
    completedDate: { pageIndex: 0, x: 260.3, y: 401.9, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 401.9, fontSize: 9, maxWidth: 110 },
  },
  long_term_so_thien: {
    completedDate: { pageIndex: 0, x: 260.3, y: 386.3, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 386.3, fontSize: 9, maxWidth: 110 },
  },
  long_term_trung_thien: {
    completedDate: { pageIndex: 0, x: 260.3, y: 370.6, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 370.6, fontSize: 9, maxWidth: 110 },
  },
  long_term_chanh_thien: {
    completedDate: { pageIndex: 0, x: 260.3, y: 354.9, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 354.9, fontSize: 9, maxWidth: 110 },
  },
  long_term_hoa: {
    completedDate: { pageIndex: 0, x: 260.3, y: 339.2, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 339.2, fontSize: 9, maxWidth: 110 },
  },
  long_term_truc: {
    completedDate: { pageIndex: 0, x: 260.3, y: 323.5, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 323.5, fontSize: 9, maxWidth: 110 },
  },
  long_term_kien: {
    completedDate: { pageIndex: 0, x: 260.3, y: 277.9, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 438.4, y: 277.9, fontSize: 9, maxWidth: 110 },
  },
  long_term_tri: {
    completedDate: { pageIndex: 0, x: 260.3, y: 262.2, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 262.2, fontSize: 9, maxWidth: 110 },
  },
  long_term_dinh: {
    completedDate: { pageIndex: 0, x: 260.3, y: 246.5, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 246.5, fontSize: 9, maxWidth: 110 },
  },
  long_term_luc: {
    completedDate: { pageIndex: 0, x: 260.3, y: 230.8, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 437.6, y: 230.8, fontSize: 9, maxWidth: 110 },
  },
  camp_tuyet_son: {
    completedDate: { pageIndex: 0, x: 293.3, y: 157, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 470, y: 157, fontSize: 9, maxWidth: 82 },
  },
  camp_anoma_nilien: {
    completedDate: { pageIndex: 0, x: 293.3, y: 141.2, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 471.5, y: 141.2, fontSize: 9, maxWidth: 80 },
  },
  camp_loc_uyen: {
    completedDate: { pageIndex: 0, x: 293.3, y: 95.6, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 468.8, y: 95.6, fontSize: 9, maxWidth: 84 },
  },
  camp_a_duc: {
    completedDate: { pageIndex: 0, x: 293.3, y: 79.9, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 468.5, y: 79.9, fontSize: 9, maxWidth: 84 },
  },
  camp_huyen_trang: {
    completedDate: { pageIndex: 0, x: 293.3, y: 64.2, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 468.8, y: 64.2, fontSize: 9, maxWidth: 78 },
  },
  camp_van_hanh: {
    completedDate: { pageIndex: 0, x: 293.3, y: 48.5, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 0, x: 468.5, y: 48.5, fontSize: 9, maxWidth: 78 },
  },
  ordination_tap: {
    completedDate: { pageIndex: 1, x: 215.3, y: 692.8, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 1, x: 401.6, y: 692.8, fontSize: 9, maxWidth: 150 },
  },
  ordination_tin: {
    completedDate: { pageIndex: 1, x: 217.9, y: 677, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 1, x: 401.6, y: 677, fontSize: 9, maxWidth: 150 },
  },
  ordination_tan: {
    completedDate: { pageIndex: 1, x: 217.9, y: 661.4, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 1, x: 401.6, y: 661.4, fontSize: 9, maxWidth: 150 },
  },
  ordination_dung: {
    completedDate: { pageIndex: 1, x: 217, y: 645.7, fontSize: 9, maxWidth: 88 },
    decisionNo: { pageIndex: 1, x: 401.6, y: 645.7, fontSize: 9, maxWidth: 150 },
  },
};

export type MauGiaPhaLineSection = {
  pageIndex: number;
  x: number;
  firstY: number;
  lineHeight: number;
  maxLines: number;
  fontSize?: number;
  maxWidth: number;
};

export const MAU_GIA_PHA_LINE_SECTIONS = {
  roles: { pageIndex: 1, x: 77.3, firstY: 601.8, lineHeight: 15.7, maxLines: 7, fontSize: 9, maxWidth: 470 },
  achievements: { pageIndex: 1, x: 77.3, firstY: 476.5, lineHeight: 15.7, maxLines: 13, fontSize: 9, maxWidth: 470 },
  comments: { pageIndex: 1, x: 77.3, firstY: 257.1, lineHeight: 15.7, maxLines: 8, fontSize: 9, maxWidth: 470 },
} satisfies Record<string, MauGiaPhaLineSection>;

