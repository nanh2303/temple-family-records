import type { DevoteeTrainingRecord } from "@/types/devotee";

export const DEVOTEE_TRAINING_CATEGORIES = {
  long_term: "Tu học trường kỳ",
  camp: "Trại huấn luyện",
  ordination_level: "Các cấp đã thọ",
} as const;

export type DevoteeTrainingCategory = keyof typeof DEVOTEE_TRAINING_CATEGORIES;

export const DEVOTEE_TRAINING_RECORD_DEFINITIONS = [
  {
    key: "long_term_mo_mat",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Mở Mắt",
  },
  {
    key: "long_term_canh_mem",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Cánh Mềm",
  },
  {
    key: "long_term_chan_cung",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Chân Cứng",
  },
  {
    key: "long_term_tung_bay",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Tung Bay",
  },
  {
    key: "long_term_huong_thien",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Hướng Thiện",
  },
  {
    key: "long_term_so_thien",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Sơ Thiện",
  },
  {
    key: "long_term_trung_thien",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Trung Thiện",
  },
  {
    key: "long_term_chanh_thien",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Chánh Thiện",
  },
  {
    key: "long_term_hoa",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Hòa",
  },
  {
    key: "long_term_truc",
    category: "long_term",
    group: "Đoàn sinh",
    label: "Vượt Bậc Trực",
  },
  {
    key: "long_term_kien",
    category: "long_term",
    group: "Huynh trưởng",
    label: "Vượt Bậc Kiên",
  },
  {
    key: "long_term_tri",
    category: "long_term",
    group: "Huynh trưởng",
    label: "Vượt Bậc Trì",
  },
  {
    key: "long_term_dinh",
    category: "long_term",
    group: "Huynh trưởng",
    label: "Vượt Bậc Định",
  },
  {
    key: "long_term_luc",
    category: "long_term",
    group: "Huynh trưởng",
    label: "Vượt Bậc Lực",
  },
  {
    key: "camp_tuyet_son",
    category: "camp",
    group: "Đoàn sinh",
    label: "Trúng cách Tuyết Sơn",
  },
  {
    key: "camp_anoma_nilien",
    category: "camp",
    group: "Đoàn sinh",
    label: "Trúng cách Anoma-Niliên",
  },
  {
    key: "camp_loc_uyen",
    category: "camp",
    group: "Huynh trưởng",
    label: "Trúng cách Lộc Uyển",
  },
  {
    key: "camp_a_duc",
    category: "camp",
    group: "Huynh trưởng",
    label: "Trúng cách A Dục",
  },
  {
    key: "camp_huyen_trang",
    category: "camp",
    group: "Huynh trưởng",
    label: "Trúng cách Huyền Trang",
  },
  {
    key: "camp_van_hanh",
    category: "camp",
    group: "Huynh trưởng",
    label: "Trúng cách Vạn Hạnh",
  },
  {
    key: "ordination_tap",
    category: "ordination_level",
    group: "Cấp đã thọ",
    label: "Thọ Cấp Tập",
  },
  {
    key: "ordination_tin",
    category: "ordination_level",
    group: "Cấp đã thọ",
    label: "Thọ Cấp Tín",
  },
  {
    key: "ordination_tan",
    category: "ordination_level",
    group: "Cấp đã thọ",
    label: "Thọ Cấp Tấn",
  },
  {
    key: "ordination_dung",
    category: "ordination_level",
    group: "Cấp đã thọ",
    label: "Thọ Cấp Dũng",
  },
] as const;

export type DevoteeTrainingRecordDefinition =
  (typeof DEVOTEE_TRAINING_RECORD_DEFINITIONS)[number];

export type DevoteeTrainingRecordKey =
  DevoteeTrainingRecordDefinition["key"];

export const DEVOTEE_TRAINING_RECORD_KEYS =
  DEVOTEE_TRAINING_RECORD_DEFINITIONS.map(
    (definition) => definition.key,
  ) as [DevoteeTrainingRecordKey, ...DevoteeTrainingRecordKey[]];

const TRAINING_DEFINITION_BY_KEY = new Map(
  DEVOTEE_TRAINING_RECORD_DEFINITIONS.map((definition) => [
    definition.key,
    definition,
  ]),
);

function normalizeTrainingText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getTrainingRecordDefinition(
  key: string | null | undefined,
) {
  if (!key) return undefined;
  return TRAINING_DEFINITION_BY_KEY.get(key as DevoteeTrainingRecordKey);
}

export function getTrainingRecordDefinitionForRecord(
  record: Pick<DevoteeTrainingRecord, "record_key" | "category" | "title">,
) {
  const keyedDefinition = getTrainingRecordDefinition(record.record_key);
  if (keyedDefinition) return keyedDefinition;

  const normalizedTitle = normalizeTrainingText(record.title);
  return DEVOTEE_TRAINING_RECORD_DEFINITIONS.find((definition) => {
    if (definition.category !== record.category) return false;
    const normalizedLabel = normalizeTrainingText(definition.label);
    return (
      normalizedTitle === normalizedLabel ||
      normalizedTitle.includes(normalizedLabel)
    );
  });
}

