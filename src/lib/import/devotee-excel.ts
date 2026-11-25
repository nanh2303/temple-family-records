import ExcelJS from "exceljs";

import {
  buildImportSummary,
  DEVOTEE_CSV_FIELD_CONFIG,
  MAX_CSV_IMPORT_ROWS,
  mapDevoteeCsvHeader,
  parseDevoteeCsv,
  type DevoteeCsvField,
  type DevoteeCsvImportPreview,
} from "@/lib/import/devotee-csv";

type SheetRowSource = {
  sheetName: string;
  rowNumber: number;
  values: Partial<Record<DevoteeCsvField, string>>;
  warnings: string[];
};

function hasContent(values: unknown[]) {
  return values.some((value) => cellText(value).trim().length > 0);
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date && !Number.isNaN(value.valueOf()))
    return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value) return cellText(value.result);
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("richText" in value && Array.isArray(value.richText))
      return value.richText
        .map((part) => ("text" in part ? part.text : ""))
        .join("");
  }
  return String(value);
}

function isDateField(field: DevoteeCsvField) {
  return field === "birth_date" || field.endsWith("_date");
}

function partialDateNote(field: DevoteeCsvField, value: string) {
  const yearOnly = /^\d{4}$/.test(value);
  const monthAndYear = /^(\d{1,2})[/-](\d{4})$/.test(value);
  if (!yearOnly && !monthAndYear) return null;

  const config = DEVOTEE_CSV_FIELD_CONFIG.find((item) => item.field === field);
  const label = config?.label ?? field;
  const detail = yearOnly ? `Năm ${value}` : value;
  return {
    note: `${label} theo file: ${detail}`,
    warning: `${label} chỉ có một phần ngày tháng (${detail}); đã để trống trường ngày để tránh tự thêm ngày hoặc tháng.`,
  };
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function makeCsv(headers: DevoteeCsvField[], rows: SheetRowSource[]) {
  return [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row.values[header] ?? "")).join(","),
    ),
  ].join("\r\n");
}

export async function parseDevoteeExcel(
  buffer: ArrayBuffer,
): Promise<DevoteeCsvImportPreview> {
  const workbook = new ExcelJS.Workbook();
  const workbookBuffer = Buffer.from(buffer);
  await workbook.xlsx.load(
    workbookBuffer as unknown as Parameters<typeof workbook.xlsx.load>[0],
  );

  const sourceRows: SheetRowSource[] = [];
  const headers = new Set<DevoteeCsvField>();
  const unmappedHeaders = new Set<string>();
  const globalErrors: string[] = [];

  for (const worksheet of workbook.worksheets) {
    const rows: { rowNumber: number; cells: unknown[] }[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const cells = (row.values as unknown[]).slice(1);
      if (hasContent(cells)) rows.push({ rowNumber, cells });
    });
    if (rows.length === 0) continue;

    const headerRow = rows[0];
    const fieldIndexes = new Map<DevoteeCsvField, number>();
    const seenHeaders = new Set<DevoteeCsvField>();
    headerRow.cells.forEach((value, index) => {
      const rawHeader = cellText(value).trim();
      if (!rawHeader) return;
      const field = mapDevoteeCsvHeader(rawHeader);
      if (!field) {
        unmappedHeaders.add(rawHeader);
        return;
      }
      if (seenHeaders.has(field)) {
        globalErrors.push(
          `Sheet “${worksheet.name}” có nhiều cột cùng map vào “${field}”; hãy sửa header trước khi import.`,
        );
        return;
      }
      seenHeaders.add(field);
      fieldIndexes.set(field, index);
      headers.add(field);
    });

    if (!fieldIndexes.has("full_name")) {
      globalErrors.push(
        `Không tìm thấy cột Họ và tên trong sheet “${worksheet.name}”.`,
      );
      continue;
    }

    for (const source of rows.slice(1)) {
      const values: Partial<Record<DevoteeCsvField, string>> = {};
      const warnings: string[] = [];
      const notes: string[] = [];
      for (const [field, index] of fieldIndexes) {
        const rawValue = cellText(source.cells[index]).trim();
        if (!rawValue) continue;
        if (isDateField(field)) {
          const partial = partialDateNote(field, rawValue);
          if (partial) {
            notes.push(partial.note);
            warnings.push(partial.warning);
            continue;
          }
        }
        values[field] = rawValue;
      }
      if (notes.length > 0) {
        values.other_notes = [values.other_notes, ...notes]
          .filter(Boolean)
          .join("; ");
        headers.add("other_notes");
      }
      if (Object.values(values).some((value) => value?.trim()))
        sourceRows.push({
          sheetName: worksheet.name,
          rowNumber: source.rowNumber,
          values,
          warnings,
        });
    }
  }

  if (sourceRows.length > MAX_CSV_IMPORT_ROWS)
    globalErrors.push(
      `File có ${sourceRows.length} dòng dữ liệu. Giới hạn hiện tại là ${MAX_CSV_IMPORT_ROWS.toLocaleString("vi-VN")} dòng/lần import.`,
    );

  const orderedHeaders = [...headers];
  if (orderedHeaders.length === 0)
    return {
      delimiter: "XLSX",
      headers: [],
      mappedHeaders: [],
      unmappedHeaders: [...unmappedHeaders],
      duplicateHeaders: [],
      globalErrors: [...globalErrors, "Workbook không có header được hỗ trợ."],
      rows: [],
      summary: buildImportSummary([]),
    };

  const preview = parseDevoteeCsv(makeCsv(orderedHeaders, sourceRows));
  const rows = preview.rows.map((row, index) => {
    const source = sourceRows[index];
    const warnings = [...row.warnings, ...(source?.warnings ?? [])];
    return {
      ...row,
      sourceLabel: source
        ? `${source.sheetName} · dòng ${source.rowNumber}`
        : undefined,
      warnings,
      status:
        row.errors.length > 0
          ? ("error" as const)
          : warnings.length > 0
            ? ("warning" as const)
            : ("ready" as const),
    };
  });

  return {
    ...preview,
    delimiter: "XLSX",
    headers: orderedHeaders,
    mappedHeaders: orderedHeaders.map((field) => ({
      header: field,
      field,
      label:
        DEVOTEE_CSV_FIELD_CONFIG.find((item) => item.field === field)?.label ??
        field,
    })),
    unmappedHeaders: [...unmappedHeaders],
    globalErrors: [...preview.globalErrors, ...globalErrors],
    rows,
    summary: buildImportSummary(rows),
  };
}
