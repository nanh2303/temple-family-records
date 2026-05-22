import { NextResponse } from "next/server";

import { splitDevoteeProfilePayload, upsertDevoteeAfterlife } from "@/lib/data/devotee-afterlife";
import {
  applyDevoteeCsvDuplicateChecks,
  getImportableRows,
  getPreviewRows,
  parseDevoteeCsv,
  type ExistingDevoteeForImport,
} from "@/lib/import/devotee-csv";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_CSV_FILE_BYTES = 2 * 1024 * 1024;
const INSERT_BATCH_SIZE = 500;

type ImportAction = "preview" | "commit";
type ServerSupabaseClient = Awaited<
  ReturnType<typeof createServerSupabaseClient>
>;

function isImportAction(
  value: FormDataEntryValue | null,
): value is ImportAction {
  return value === "preview" || value === "commit";
}

async function readCsvFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Hãy chọn một file CSV.");
  if (file.size === 0) throw new Error("File CSV đang rỗng.");
  if (file.size > MAX_CSV_FILE_BYTES)
    throw new Error("File CSV quá lớn. Giới hạn hiện tại là 2MB/lần import.");
  return file.text();
}

async function fetchExistingDevotees(supabase: ServerSupabaseClient) {
  const pageSize = 1_000;
  let from = 0;
  const devotees: ExistingDevoteeForImport[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("devotees")
      .select(
        "id,family_registry_no,bhd_registry_no,full_name,birth_date,dharma_name,father_name,mother_name",
      )
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    const batch = data ?? [];
    devotees.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return devotees;
}

async function insertInBatches(
  supabase: ServerSupabaseClient,
  rows: ReturnType<typeof getImportableRows>,
) {
  const inserted: { id: string; full_name: string }[] = [];

  for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
    const batch = rows
      .slice(start, start + INSERT_BATCH_SIZE)
      .flatMap((row) => (row.parsedData ? [{ row, payload: splitDevoteeProfilePayload(row.parsedData) }] : []));

    if (batch.length === 0) continue;

    const { data, error } = await supabase
      .from("devotees")
      .insert(batch.map((entry) => entry.payload.devotee))
      .select("id,full_name");
    if (error) throw new Error(error.message);

    const created = data ?? [];
    for (let index = 0; index < batch.length; index += 1) {
      const createdDevotee = created[index];
      const { afterlife } = batch[index].payload;
      if (!createdDevotee) continue;

      if (afterlife) {
        await upsertDevoteeAfterlife(supabase, createdDevotee.id, afterlife);
      }

      inserted.push(createdDevotee);
    }
  }

  return inserted;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  if (!formData)
    return NextResponse.json(
      { error: "Request phải là multipart/form-data." },
      { status: 400 },
    );

  const actionValue = formData.get("action");
  const action = isImportAction(actionValue) ? actionValue : "preview";

  try {
    const csvText = await readCsvFile(formData);
    const existingDevotees = await fetchExistingDevotees(supabase);
    const parsedPreview = parseDevoteeCsv(csvText);
    const preview = applyDevoteeCsvDuplicateChecks(
      parsedPreview,
      existingDevotees,
    );
    const previewRows = getPreviewRows(preview);

    if (action === "preview") {
      return NextResponse.json({
        action,
        ...preview,
        rows: previewRows,
        truncated: preview.rows.length > previewRows.length,
      });
    }

    if (preview.globalErrors.length > 0) {
      return NextResponse.json(
        {
          action,
          error: "CSV chưa hợp lệ để import.",
          ...preview,
          rows: previewRows,
          truncated: preview.rows.length > previewRows.length,
        },
        { status: 400 },
      );
    }

    const importableRows = getImportableRows(preview);
    if (importableRows.length === 0) {
      return NextResponse.json(
        {
          action,
          error: "Không có dòng hợp lệ để import.",
          ...preview,
          rows: previewRows,
          truncated: preview.rows.length > previewRows.length,
        },
        { status: 400 },
      );
    }

    const inserted = await insertInBatches(supabase, importableRows);
    return NextResponse.json({
      action,
      insertedCount: inserted.length,
      inserted,
      ...preview,
      rows: previewRows,
      truncated: preview.rows.length > previewRows.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể import CSV.",
      },
      { status: 400 },
    );
  }
}
