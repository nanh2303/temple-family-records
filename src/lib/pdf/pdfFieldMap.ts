/**
 * Maps logical devotee fields to PDF form field names or stamping anchors.
 *
 * TODO: Open `public/templates/MauGiaPha-So-05.BHDTU.pdf` in a PDF editor, list AcroForm field
 * names (if the template is fillable), and replace the placeholder keys below. If the template
 * is not AcroForm-based, use `STAMP_COORDINATES` with page-indexed `{ x, y }` in PDF points and
 * implement stamping in `fillMauGiaPha.ts`.
 */

export const MAU_GIA_PHA_TEMPLATE_FILENAME = "MauGiaPha-So-05.BHDTU.pdf" as const;

/** AcroForm field names — placeholders until the real template is inspected. */
export const MAU_GIA_PHA_ACROFORM_FIELDS = {
  familyRegistryNo: "TODO_family_registry_no",
  bhdRegistryNo: "TODO_bhd_registry_no",
  fullName: "TODO_full_name",
  birthDate: "TODO_birth_date",
  birthPlace: "TODO_birth_place",
  dharmaName: "TODO_dharma_name",
  address: "TODO_address",
  joinedUnitDate: "TODO_joined_unit_date",
  vowDate: "TODO_vow_date",
  refugeDate: "TODO_refuge_date",
  preceptor: "TODO_preceptor",
  fatherName: "TODO_father_name",
  motherName: "TODO_mother_name",
  deathDate: "TODO_death_date",
  graveLocation: "TODO_grave_location",
} as const;

export type MauGiaPhaAcroformFieldKey = keyof typeof MAU_GIA_PHA_ACROFORM_FIELDS;

/**
 * Optional coordinate-based stamping (bottom-left origin in PDF user space).
 * TODO: Calibrate against the official template once `MauGiaPha-So-05.BHDTU.pdf` is in place.
 */
export const MAU_GIA_PHA_STAMP_COORDINATES: Partial<
  Record<
    MauGiaPhaAcroformFieldKey,
    {
      pageIndex: number;
      x: number;
      y: number;
      fontSize?: number;
    }
  >
> = {
  fullName: { pageIndex: 0, x: 72, y: 720, fontSize: 11 },
};
