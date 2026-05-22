import { normalizeVietnameseClient } from "@/lib/search/normalizeVietnamese";
import {
  DEVOTEE_TRAINING_RECORD_DEFINITIONS,
  type DevoteeTrainingRecordKey,
} from "@/lib/devotees/profile-sections";
import {
  devoteeProfileCreateSchema,
  type DevoteeProfileCreateInput,
} from "@/lib/validations/devotee";
import type { DevoteeRecord } from "@/types/devotee";

export const MAX_CSV_IMPORT_ROWS = 10_000;
export const CSV_PREVIEW_ROW_LIMIT = 200;

type DevoteeCoreCsvField =
  | "family_registry_no"
  | "bhd_registry_no"
  | "full_name"
  | "birth_date"
  | "birth_place"
  | "dharma_name"
  | "hometown"
  | "address"
  | "joined_unit_date"
  | "vow_date"
  | "refuge_date"
  | "preceptor"
  | "father_name"
  | "mother_name"
  | "death_date"
  | "grave_location"
  | "afterlife_note";

export type DevoteeTrainingDateCsvField = `${DevoteeTrainingRecordKey}_date`;
export type DevoteeTrainingDecisionCsvField = `${DevoteeTrainingRecordKey}_decision_no`;

export type DevoteeCsvField =
  | DevoteeCoreCsvField
  | DevoteeTrainingDateCsvField
  | DevoteeTrainingDecisionCsvField
  | "roles"
  | "achievements"
  | "comments"
  | "other_notes";

type DevoteeCsvFieldConfig = {
  field: DevoteeCsvField;
  label: string;
  examples: readonly string[];
};

export const DEVOTEE_CSV_FIELD_CONFIG = [
  {
    field: "family_registry_no",
    label: "Số danh bộ gia đình",
    examples: [
      "so danh bo gia dinh",
      "số danh bộ gia đình",
      "family_registry_no",
      "family registry no",
    ],
  },
  {
    field: "bhd_registry_no",
    label: "Số danh bộ BHD",
    examples: [
      "so danh bo bhd",
      "số danh bộ bhd",
      "bhd_registry_no",
      "bhd registry no",
    ],
  },
  {
    field: "full_name",
    label: "Họ và tên",
    examples: [
      "ho va ten",
      "họ và tên",
      "ho ten",
      "họ tên",
      "full_name",
      "full name",
      "name",
    ],
  },
  {
    field: "birth_date",
    label: "Ngày sinh",
    examples: [
      "ngay sinh",
      "ngày sinh",
      "ngay thang nam sinh",
      "birth_date",
      "birth date",
      "dob",
    ],
  },
  {
    field: "birth_place",
    label: "Nơi sinh",
    examples: ["noi sinh", "nơi sinh", "birth_place", "birth place"],
  },
  {
    field: "dharma_name",
    label: "Pháp danh",
    examples: ["phap danh", "pháp danh", "dharma_name", "dharma name"],
  },
  {
    field: "hometown",
    label: "Quê quán",
    examples: [
      "que quan",
      "quê quán",
      "nguyen quan",
      "nguyên quán",
      "hometown",
    ],
  },
  {
    field: "address",
    label: "Địa chỉ",
    examples: ["dia chi", "địa chỉ", "address"],
  },
  {
    field: "joined_unit_date",
    label: "Ngày vào Đơn vị",
    examples: [
      "ngay vao don vi",
      "ngày vào đơn vị",
      "joined_unit_date",
      "joined unit date",
    ],
  },
  {
    field: "vow_date",
    label: "Ngày Phát nguyện",
    examples: ["ngay phat nguyen", "ngày phát nguyện", "vow_date", "vow date"],
  },
  {
    field: "refuge_date",
    label: "Ngày Quy y",
    examples: ["ngay quy y", "ngày quy y", "refuge_date", "refuge date"],
  },
  {
    field: "preceptor",
    label: "Bổn Sư truyền giới",
    examples: [
      "bon su truyen gioi",
      "bổn sư truyền giới",
      "bon su",
      "preceptor",
    ],
  },
  {
    field: "father_name",
    label: "Tên Cha",
    examples: ["ten cha", "tên cha", "cha", "father_name", "father name"],
  },
  {
    field: "mother_name",
    label: "Tên Mẹ",
    examples: ["ten me", "tên mẹ", "me", "mẹ", "mother_name", "mother name"],
  },
  {
    field: "death_date",
    label: "Tạ thế ngày",
    examples: [
      "ta the ngay",
      "tạ thế ngày",
      "ngay mat",
      "ngày mất",
      "death_date",
      "death date",
    ],
  },
  {
    field: "grave_location",
    label: "Mộ chí tại",
    examples: [
      "mo chi tai",
      "mộ chí tại",
      "noi an tang",
      "nơi an táng",
      "grave_location",
      "grave location",
    ],
  },
  {
    field: "afterlife_note",
    label: "Ghi chú hậu thế",
    examples: ["ghi chu hau the", "ghi chú hậu thế", "afterlife_note", "afterlife note"],
  },
  ...DEVOTEE_TRAINING_RECORD_DEFINITIONS.flatMap((definition) => [
    {
      field: `${definition.key}_date` as DevoteeTrainingDateCsvField,
      label: `${definition.label} - Ngày`,
      examples: [`${definition.label} ngày`, `${definition.key}_date`, `${definition.key} date`],
    },
    {
      field: `${definition.key}_decision_no` as DevoteeTrainingDecisionCsvField,
      label: `${definition.label} - Quyết định số`,
      examples: [
        `${definition.label} quyết định số`,
        `${definition.key}_decision_no`,
        `${definition.key} decision no`,
      ],
    },
  ]),
  {
    field: "roles",
    label: "Các chức vụ từng đảm nhận",
    examples: ["chuc vu", "chức vụ", "roles", "positions"],
  },
  {
    field: "achievements",
    label: "Thành tích cá nhân",
    examples: ["thanh tich", "thành tích", "achievements"],
  },
  {
    field: "comments",
    label: "Các nhận xét khác",
    examples: ["nhan xet", "nhận xét", "comments"],
  },
  {
    field: "other_notes",
    label: "Ghi chú khác",
    examples: ["ghi chu khac", "ghi chú khác", "other_notes", "other notes"],
  },
] satisfies readonly DevoteeCsvFieldConfig[];

export type ExistingDevoteeForImport = Pick<
  DevoteeRecord,
  | "id"
  | "family_registry_no"
  | "bhd_registry_no"
  | "full_name"
  | "birth_date"
  | "dharma_name"
  | "father_name"
  | "mother_name"
>;

export type DevoteeCsvRowStatus = "ready" | "warning" | "error";
export type DevoteeCsvImportRow = {
  rowNumber: number;
  status: DevoteeCsvRowStatus;
  values: Partial<Record<DevoteeCsvField, string>>;
  parsedData: DevoteeProfileCreateInput | null;
  errors: string[];
  warnings: string[];
};
export type DevoteeCsvImportSummary = {
  totalRows: number;
  readyRows: number;
  warningRows: number;
  errorRows: number;
  importableRows: number;
};
export type DevoteeCsvImportPreview = {
  delimiter: string;
  headers: string[];
  mappedHeaders: {
    header: string;
    field: DevoteeCsvField | null;
    label: string | null;
  }[];
  unmappedHeaders: string[];
  duplicateHeaders: string[];
  globalErrors: string[];
  rows: DevoteeCsvImportRow[];
  summary: DevoteeCsvImportSummary;
};

const FIELD_LABELS = new Map(
  DEVOTEE_CSV_FIELD_CONFIG.map((config) => [config.field, config.label]),
);
const FIELD_BY_ALIAS = new Map<string, DevoteeCsvField>();

for (const config of DEVOTEE_CSV_FIELD_CONFIG) {
  FIELD_BY_ALIAS.set(normalizeHeader(config.field), config.field);
  FIELD_BY_ALIAS.set(normalizeHeader(config.label), config.field);
  for (const example of config.examples)
    FIELD_BY_ALIAS.set(normalizeHeader(example), config.field);
}

function normalizeHeader(input: string) {
  return normalizeVietnameseClient(input)
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function normalizeComparable(input: string | null | undefined) {
  if (!input) return "";
  return normalizeVietnameseClient(input).replace(/\s+/g, " ").trim();
}
function hasContent(cells: string[]) {
  return cells.some((cell) => cell.trim().length > 0);
}
function countDelimiter(line: string, delimiter: string) {
  let inQuotes = false,
    count = 0;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i],
      nextChar = line[i + 1];
    if (char === '"' && inQuotes && nextChar === '"') {
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === delimiter) count += 1;
  }
  return count;
}
function detectDelimiter(text: string) {
  const candidateLines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .slice(0, 5);
  const delimiters = [",", ";", "\t"];
  let bestDelimiter = ",",
    bestScore = -1;
  for (const delimiter of delimiters) {
    const score = candidateLines.reduce(
      (total, line) => total + countDelimiter(line, delimiter),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = delimiter;
    }
  }
  return bestDelimiter;
}
function parseCsvRows(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    inQuotes = false;
  const normalizedText = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < normalizedText.length; i += 1) {
    const char = normalizedText[i],
      nextChar = normalizedText[i + 1];
    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") i += 1;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }
  if (inQuotes)
    throw new Error("CSV có dấu nháy kép chưa đóng. Hãy kiểm tra lại file.");
  return rows;
}
function normalizeDateValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^(\d{4})-(\d{2})-(\d{2})$/.test(trimmed)) return trimmed;
  const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
  if (!match) return trimmed;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
function getTrainingDateKey(field: DevoteeCsvField): DevoteeTrainingRecordKey | null {
  if (!field.endsWith("_date")) return null;
  const key = field.slice(0, -"_date".length);
  return DEVOTEE_TRAINING_RECORD_DEFINITIONS.some((definition) => definition.key === key)
    ? (key as DevoteeTrainingRecordKey)
    : null;
}
function getTrainingDecisionKey(field: DevoteeCsvField): DevoteeTrainingRecordKey | null {
  if (!field.endsWith("_decision_no")) return null;
  const key = field.slice(0, -"_decision_no".length);
  return DEVOTEE_TRAINING_RECORD_DEFINITIONS.some((definition) => definition.key === key)
    ? (key as DevoteeTrainingRecordKey)
    : null;
}
function splitListCell(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}
function buildProfileInputFromCsvValues(values: Partial<Record<DevoteeCsvField, string>>) {
  const input: Record<string, unknown> = {};
  const trainingRecords = new Map<DevoteeTrainingRecordKey, { completed_date: string; decision_no: string }>();

  for (const [field, rawValue] of Object.entries(values) as [DevoteeCsvField, string][]) {
    const trainingDateKey = getTrainingDateKey(field);
    if (trainingDateKey) {
      const current = trainingRecords.get(trainingDateKey) ?? { completed_date: "", decision_no: "" };
      trainingRecords.set(trainingDateKey, { ...current, completed_date: rawValue });
      continue;
    }

    const trainingDecisionKey = getTrainingDecisionKey(field);
    if (trainingDecisionKey) {
      const current = trainingRecords.get(trainingDecisionKey) ?? { completed_date: "", decision_no: "" };
      trainingRecords.set(trainingDecisionKey, { ...current, decision_no: rawValue });
      continue;
    }

    if (field === "roles" || field === "achievements" || field === "comments" || field === "other_notes") {
      continue;
    }

    input[field] = rawValue;
  }

  const training_records = DEVOTEE_TRAINING_RECORD_DEFINITIONS.flatMap((definition) => {
    const record = trainingRecords.get(definition.key);
    if (!record || (!record.completed_date && !record.decision_no)) return [];
    return [{ key: definition.key, ...record }];
  });

  const notes = [
    ...splitListCell(values.achievements).map((content) => ({ note_type: "achievement" as const, content })),
    ...splitListCell(values.comments).map((content) => ({ note_type: "comment" as const, content })),
    ...splitListCell(values.other_notes).map((content) => ({ note_type: "other" as const, content })),
  ];

  const roles = splitListCell(values.roles).map((role_title) => ({ role_title }));

  if (training_records.length > 0) input.training_records = training_records;
  if (roles.length > 0) input.roles = roles;
  if (notes.length > 0) input.notes = notes;

  return input;
}
function mapHeader(header: string): DevoteeCsvField | null {
  return FIELD_BY_ALIAS.get(normalizeHeader(header)) ?? null;
}
function labelFor(field: DevoteeCsvField) {
  return FIELD_LABELS.get(field) ?? field;
}
function validationMessagesForRow(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  return error.issues.map((issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && FIELD_LABELS.has(field as DevoteeCsvField))
      return `${labelFor(field as DevoteeCsvField)}: ${issue.message}`;
    return issue.message;
  });
}
function buildIdentityKey(
  values: Pick<
    DevoteeProfileCreateInput,
    "full_name" | "birth_date" | "father_name" | "mother_name"
  >,
) {
  if (!values.full_name || !values.birth_date) return "";
  return [
    normalizeComparable(values.full_name),
    values.birth_date,
    normalizeComparable(values.father_name),
    normalizeComparable(values.mother_name),
  ].join("|");
}
function buildExistingIdentityKey(devotee: ExistingDevoteeForImport) {
  if (!devotee.full_name || !devotee.birth_date) return "";
  return [
    normalizeComparable(devotee.full_name),
    devotee.birth_date,
    normalizeComparable(devotee.father_name),
    normalizeComparable(devotee.mother_name),
  ].join("|");
}
function pushDuplicateError(
  index: Map<string, number>,
  key: string,
  rowNumber: number,
  message: (firstRow: number) => string,
) {
  if (!key) return null;
  const firstRow = index.get(key);
  if (firstRow) return message(firstRow);
  index.set(key, rowNumber);
  return null;
}
function applyRowStatus(
  row: Omit<DevoteeCsvImportRow, "status">,
): DevoteeCsvImportRow {
  const status: DevoteeCsvRowStatus =
    row.errors.length > 0
      ? "error"
      : row.warnings.length > 0
        ? "warning"
        : "ready";
  return { ...row, status };
}
export function buildImportSummary(
  rows: DevoteeCsvImportRow[],
): DevoteeCsvImportSummary {
  return rows.reduce(
    (summary, row) => {
      summary.totalRows += 1;
      if (row.status === "ready") summary.readyRows += 1;
      if (row.status === "warning") summary.warningRows += 1;
      if (row.status === "error") summary.errorRows += 1;
      if (row.parsedData && row.errors.length === 0)
        summary.importableRows += 1;
      return summary;
    },
    {
      totalRows: 0,
      readyRows: 0,
      warningRows: 0,
      errorRows: 0,
      importableRows: 0,
    },
  );
}
export function parseDevoteeCsv(text: string): DevoteeCsvImportPreview {
  const globalErrors: string[] = [];
  const delimiter = detectDelimiter(text);
  const csvRows = parseCsvRows(text, delimiter);
  const headerIndex = csvRows.findIndex(hasContent);
  if (headerIndex < 0)
    return {
      delimiter,
      headers: [],
      mappedHeaders: [],
      unmappedHeaders: [],
      duplicateHeaders: [],
      globalErrors: ["File CSV không có header."],
      rows: [],
      summary: buildImportSummary([]),
    };
  const headers = csvRows[headerIndex].map((header) => header.trim());
  const seenFields = new Set<DevoteeCsvField>();
  const duplicateHeaders: string[] = [];
  const mappedHeaders = headers.map((header) => {
    const field = mapHeader(header);
    if (!field) return { header, field: null, label: null };
    if (seenFields.has(field)) {
      duplicateHeaders.push(header);
      return { header, field: null, label: null };
    }
    seenFields.add(field);
    return { header, field, label: labelFor(field) };
  });
  const unmappedHeaders = mappedHeaders
    .filter((entry) => !entry.field && entry.header.trim())
    .map((entry) => entry.header);
  if (!seenFields.has("full_name"))
    globalErrors.push(
      "Không tìm thấy cột Họ và tên. Cần có một header như: ho va ten, họ tên, full_name.",
    );
  if (duplicateHeaders.length > 0)
    globalErrors.push(
      `Có header bị map trùng field và đã bị bỏ qua: ${duplicateHeaders.join(", ")}.`,
    );
  const dataRows = csvRows.slice(headerIndex + 1).filter(hasContent);
  if (dataRows.length > MAX_CSV_IMPORT_ROWS)
    globalErrors.push(
      `File có ${dataRows.length} dòng dữ liệu. Giới hạn hiện tại là ${MAX_CSV_IMPORT_ROWS} dòng/lần import.`,
    );
  const rows = dataRows.slice(0, MAX_CSV_IMPORT_ROWS).map((cells, index) => {
    const values: Partial<Record<DevoteeCsvField, string>> = {};
    for (const [cellIndex, rawValue] of cells.entries()) {
      const field = mappedHeaders[cellIndex]?.field;
      if (!field) continue;
      const value = rawValue.trim();
      values[field] = field.endsWith("_date")
        ? normalizeDateValue(value)
        : value;
    }
    const parsed = devoteeProfileCreateSchema.safeParse(
      buildProfileInputFromCsvValues(values),
    );
    const baseRow = {
      rowNumber: headerIndex + index + 2,
      values,
      parsedData: parsed.success ? parsed.data : null,
      errors: parsed.success ? [] : validationMessagesForRow(parsed.error),
      warnings: [] as string[],
    };
    if (
      parsed.success &&
      !parsed.data.family_registry_no &&
      !parsed.data.bhd_registry_no
    )
      baseRow.warnings.push(
        "Không có số danh bộ gia đình hoặc số danh bộ BHD; sau này sẽ khó đối chiếu trùng.",
      );
    return applyRowStatus(baseRow);
  });
  return {
    delimiter,
    headers,
    mappedHeaders,
    unmappedHeaders,
    duplicateHeaders,
    globalErrors,
    rows,
    summary: buildImportSummary(rows),
  };
}
export function applyDevoteeCsvDuplicateChecks(
  preview: DevoteeCsvImportPreview,
  existingDevotees: ExistingDevoteeForImport[],
): DevoteeCsvImportPreview {
  const familyRegistryRows = new Map<string, number>(),
    bhdRegistryRows = new Map<string, number>(),
    identityRows = new Map<string, number>();
  const existingFamilyRegistry = new Map<string, ExistingDevoteeForImport>(),
    existingBhdRegistry = new Map<string, ExistingDevoteeForImport>(),
    existingIdentity = new Map<string, ExistingDevoteeForImport>();
  for (const devotee of existingDevotees) {
    const familyKey = normalizeComparable(devotee.family_registry_no),
      bhdKey = normalizeComparable(devotee.bhd_registry_no),
      identityKey = buildExistingIdentityKey(devotee);
    if (familyKey) existingFamilyRegistry.set(familyKey, devotee);
    if (bhdKey) existingBhdRegistry.set(bhdKey, devotee);
    if (identityKey) existingIdentity.set(identityKey, devotee);
  }
  const rows = preview.rows.map((row) => {
    const errors = [...row.errors],
      warnings = [...row.warnings];
    if (row.parsedData) {
      const familyKey = normalizeComparable(row.parsedData.family_registry_no),
        bhdKey = normalizeComparable(row.parsedData.bhd_registry_no),
        identityKey = buildIdentityKey(row.parsedData);
      const familyRowError = pushDuplicateError(
        familyRegistryRows,
        familyKey,
        row.rowNumber,
        (firstRow) =>
          `Trùng số danh bộ gia đình với dòng ${firstRow} trong file.`,
      );
      if (familyRowError) errors.push(familyRowError);
      const bhdRowError = pushDuplicateError(
        bhdRegistryRows,
        bhdKey,
        row.rowNumber,
        (firstRow) => `Trùng số danh bộ BHD với dòng ${firstRow} trong file.`,
      );
      if (bhdRowError) errors.push(bhdRowError);
      const identityRowWarning = pushDuplicateError(
        identityRows,
        identityKey,
        row.rowNumber,
        (firstRow) =>
          `Có vẻ trùng họ tên + ngày sinh + cha/mẹ với dòng ${firstRow} trong file.`,
      );
      if (identityRowWarning) warnings.push(identityRowWarning);
      const existingFamily = familyKey
        ? existingFamilyRegistry.get(familyKey)
        : null;
      if (existingFamily)
        errors.push(
          `Số danh bộ gia đình đã tồn tại trong database: ${existingFamily.full_name}.`,
        );
      const existingBhd = bhdKey ? existingBhdRegistry.get(bhdKey) : null;
      if (existingBhd)
        errors.push(
          `Số danh bộ BHD đã tồn tại trong database: ${existingBhd.full_name}.`,
        );
      const existingIdentityMatch = identityKey
        ? existingIdentity.get(identityKey)
        : null;
      if (existingIdentityMatch)
        errors.push(
          `Có vẻ đã tồn tại trong database: ${existingIdentityMatch.full_name}.`,
        );
    }
    return applyRowStatus({ ...row, errors, warnings });
  });
  return { ...preview, rows, summary: buildImportSummary(rows) };
}
export function getImportableRows(preview: DevoteeCsvImportPreview) {
  return preview.rows.filter(
    (row) => row.parsedData && row.errors.length === 0,
  );
}
export function getPreviewRows(preview: DevoteeCsvImportPreview) {
  return preview.rows.slice(0, CSV_PREVIEW_ROW_LIMIT);
}
