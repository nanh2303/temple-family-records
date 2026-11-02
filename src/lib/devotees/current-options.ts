export const DEVOTEE_CURRENT_UNIT_OPTIONS = [
  "TAMNGHI",
  "GD",
  "THANHNAM",
  "THANHNU",
  "THIEUNAM",
  "THIEUNU",
  "OVNAM",
  "OVNU",
  "SENNON",
  "Không có",
] as const;

export const DEVOTEE_CURRENT_STUDY_LEVEL_OPTIONS = [
  "SENNON",
  "MỞ MẮT",
  "CÁNH MỀM",
  "CHÂN CỨNG",
  "TUNG BAY",
  "HƯỚNG THIỆN",
  "SƠ THIỆN",
  "TRUNG THIỆN",
  "CHÁNH THIỆN",
  "HÒA 1",
  "HÒA 2",
  "TRỰC",
  "KIÊN",
  "TRÌ",
  "ĐỊNH LỰC",
  "HOÀN TẤT",
  "Không có",
] as const;

export type DevoteeCurrentUnit = (typeof DEVOTEE_CURRENT_UNIT_OPTIONS)[number];
export type DevoteeCurrentStudyLevel = (typeof DEVOTEE_CURRENT_STUDY_LEVEL_OPTIONS)[number];
