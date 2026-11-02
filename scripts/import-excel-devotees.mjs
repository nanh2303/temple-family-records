/**
 * One-time import of real GĐPT Đức Tuệ Excel data into Supabase.
 *
 * Usage:
 *   node scripts/import-excel-devotees.mjs              # dry-run (default)
 *   node scripts/import-excel-devotees.mjs --commit     # wipe devotees + insert
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const INSERT_BATCH_SIZE = 50;

const TRAINING_DEFINITIONS = [
  { key: "long_term_mo_mat", category: "long_term", title: "Vượt Bậc Mở Mắt" },
  { key: "long_term_canh_mem", category: "long_term", title: "Vượt Bậc Cánh Mềm" },
  { key: "long_term_chan_cung", category: "long_term", title: "Vượt Bậc Chân Cứng" },
  { key: "long_term_tung_bay", category: "long_term", title: "Vượt Bậc Tung Bay" },
  { key: "long_term_huong_thien", category: "long_term", title: "Vượt Bậc Hướng Thiện" },
  { key: "long_term_so_thien", category: "long_term", title: "Vượt Bậc Sơ Thiện" },
  { key: "long_term_trung_thien", category: "long_term", title: "Vượt Bậc Trung Thiện" },
  { key: "long_term_chanh_thien", category: "long_term", title: "Vượt Bậc Chánh Thiện" },
  { key: "long_term_hoa", category: "long_term", title: "Vượt Bậc Hòa" },
  { key: "long_term_truc", category: "long_term", title: "Vượt Bậc Trực" },
  { key: "long_term_kien", category: "long_term", title: "Vượt Bậc Kiên" },
  { key: "long_term_tri", category: "long_term", title: "Vượt Bậc Trì" },
  { key: "long_term_dinh", category: "long_term", title: "Vượt Bậc Định" },
  { key: "long_term_luc", category: "long_term", title: "Vượt Bậc Lực" },
  { key: "camp_tuyet_son", category: "camp", title: "Trúng cách Tuyết Sơn" },
  { key: "camp_anoma_nilien", category: "camp", title: "Trúng cách Anoma-Niliên" },
  { key: "camp_loc_uyen", category: "camp", title: "Trúng cách Lộc Uyển" },
  { key: "camp_a_duc", category: "camp", title: "Trúng cách A Dục" },
  { key: "camp_huyen_trang", category: "camp", title: "Trúng cách Huyền Trang" },
  { key: "camp_van_hanh", category: "camp", title: "Trúng cách Vạn Hạnh" },
  { key: "ordination_tap", category: "ordination_level", title: "Thọ Cấp Tập" },
  { key: "ordination_tin", category: "ordination_level", title: "Thọ Cấp Tín" },
  { key: "ordination_tan", category: "ordination_level", title: "Thọ Cấp Tấn" },
  { key: "ordination_dung", category: "ordination_level", title: "Thọ Cấp Dũng" },
];

const TRAINING_BY_KEY = new Map(TRAINING_DEFINITIONS.map((d) => [d.key, d]));

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local (need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).");
  }
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseExcel() {
  const py = path.join(__dirname, "parse_gdpt_excel.py");
  const result = spawnSync("python", [py], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
  });
  if (result.status !== 0) {
    throw new Error(
      `Excel parse failed (exit ${result.status}):\n${result.stderr || result.stdout}`,
    );
  }
  const data = JSON.parse(result.stdout);
  if (!data.ok) throw new Error(data.error || "Excel parse returned ok=false");
  return data;
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function splitPayload(payload) {
  const {
    death_date = null,
    grave_location = null,
    afterlife_note = null,
    training_records = [],
    roles = [],
    notes = [],
    ...devotee
  } = payload;

  const trainingRecords = [];
  for (const record of training_records) {
    const def = TRAINING_BY_KEY.get(record.key);
    if (!def) continue;
    if (!record.completed_date && !record.decision_no) continue;
    trainingRecords.push({
      record_key: def.key,
      category: def.category,
      title: def.title,
      completed_date: record.completed_date ?? null,
      decision_no: record.decision_no ?? null,
    });
  }

  const afterlife =
    death_date || grave_location || afterlife_note
      ? {
          death_date: death_date ?? null,
          grave_location: grave_location ?? null,
          note: afterlife_note ?? null,
        }
      : null;

  return {
    devotee,
    related: {
      afterlife,
      trainingRecords,
      roles: roles.filter((r) => r.role_title?.trim()),
      notes: notes.filter((n) => n.content?.trim()),
    },
  };
}

async function wipeDevotees(supabase) {
  const { error, count } = await supabase
    .from("devotees")
    .delete({ count: "exact" })
    .gte("created_at", "1970-01-01");
  if (error) throw new Error(`Wipe failed: ${error.message}`);
  return count ?? 0;
}

async function saveRelated(supabase, devoteeId, related) {
  if (related.afterlife) {
    const { error } = await supabase.from("devotee_afterlife_info").upsert({
      devotee_id: devoteeId,
      death_date: related.afterlife.death_date,
      grave_location: related.afterlife.grave_location,
      note: related.afterlife.note,
    });
    if (error) throw new Error(`afterlife insert: ${error.message}`);
  }

  if (related.trainingRecords.length > 0) {
    const { error } = await supabase.from("devotee_training_records").insert(
      related.trainingRecords.map((record) => ({
        devotee_id: devoteeId,
        record_key: record.record_key,
        category: record.category,
        title: record.title,
        completed_date: record.completed_date,
        decision_no: record.decision_no,
      })),
    );
    if (error) throw new Error(`training insert: ${error.message}`);
  }

  if (related.roles.length > 0) {
    const { error } = await supabase.from("devotee_roles").insert(
      related.roles.map((role) => ({
        devotee_id: devoteeId,
        role_title: role.role_title,
        organization: role.organization ?? null,
        start_date: role.start_date ?? null,
        end_date: role.end_date ?? null,
        note: role.note ?? null,
      })),
    );
    if (error) throw new Error(`roles insert: ${error.message}`);
  }

  if (related.notes.length > 0) {
    const { error } = await supabase.from("devotee_notes").insert(
      related.notes.map((note) => ({
        devotee_id: devoteeId,
        note_type: note.note_type,
        content: note.content,
      })),
    );
    if (error) throw new Error(`notes insert: ${error.message}`);
  }
}

async function insertAll(supabase, rows) {
  let inserted = 0;
  let trainingCount = 0;
  let roleCount = 0;
  let noteCount = 0;
  let afterlifeCount = 0;

  for (let start = 0; start < rows.length; start += INSERT_BATCH_SIZE) {
    const batch = rows.slice(start, start + INSERT_BATCH_SIZE).map((row) => ({
      rowNumber: row.rowNumber,
      ...splitPayload(row.payload),
    }));

    const { data, error } = await supabase
      .from("devotees")
      .insert(batch.map((entry) => entry.devotee))
      .select("id,full_name");
    if (error) {
      throw new Error(
        `Devotee batch insert failed at rows ${batch[0].rowNumber}+ : ${error.message}`,
      );
    }
    const created = data ?? [];
    if (created.length !== batch.length) {
      throw new Error(
        `Expected ${batch.length} inserted devotees, got ${created.length} (batch starting row ${batch[0].rowNumber}).`,
      );
    }

    for (let i = 0; i < batch.length; i += 1) {
      const devoteeId = created[i].id;
      const { related } = batch[i];
      await saveRelated(supabase, devoteeId, related);
      inserted += 1;
      trainingCount += related.trainingRecords.length;
      roleCount += related.roles.length;
      noteCount += related.notes.length;
      if (related.afterlife) afterlifeCount += 1;
    }

    console.log(`  inserted ${inserted}/${rows.length}`);
  }

  return { inserted, trainingCount, roleCount, noteCount, afterlifeCount };
}

function printDryRun(parsed) {
  console.log("=== DRY RUN: GDPT Excel → Supabase ===");
  console.log(`Source: ${parsed.source}`);
  console.log(
    `Rows: total=${parsed.totalRows} ready=${parsed.readyRows} errors=${parsed.errorRows} warnings=${parsed.warningRows}`,
  );
  console.log(`Training column groups mapped: ${parsed.trainingColumnCount}`);
  console.log("\nUnmapped Excel columns (ignored):");
  for (const item of parsed.unmappedHeaders) {
    console.log(`  col ${item.col}: ${JSON.stringify(item.header)} (occupied ${item.occupied})`);
  }
  if (parsed.errors?.length) {
    console.log("\nRow errors:");
    for (const err of parsed.errors) {
      console.log(`  row ${err.rowNumber}: ${err.errors.join("; ")}`);
    }
  }
  if (parsed.sampleWarnings?.length) {
    console.log("\nSample warnings (first 20):");
    for (const w of parsed.sampleWarnings) {
      console.log(`  row ${w.rowNumber} ${w.full_name}: ${w.warnings.join("; ")}`);
    }
  }

  let training = 0;
  let roles = 0;
  let notes = 0;
  for (const row of parsed.rows) {
    const split = splitPayload(row.payload);
    training += split.related.trainingRecords.length;
    roles += split.related.roles.length;
    notes += split.related.notes.length;
  }
  console.log("\nWould insert:");
  console.log(`  devotees: ${parsed.readyRows}`);
  console.log(`  training_records: ${training}`);
  console.log(`  roles: ${roles}`);
  console.log(`  notes: ${notes}`);
  console.log("\nRe-run with --commit to wipe existing devotees and import.");
}

async function main() {
  const commit = process.argv.includes("--commit");
  loadEnvLocal();
  console.log("Parsing Excel…");
  const parsed = parseExcel();

  if (!commit) {
    printDryRun(parsed);
    return;
  }

  if (parsed.readyRows === 0) {
    throw new Error("No ready rows to import.");
  }

  const supabase = createAdminClient();
  console.log("Wiping existing devotees (cascade children)…");
  const wiped = await wipeDevotees(supabase);
  console.log(`  deleted ${wiped} devotee row(s)`);

  console.log(`Inserting ${parsed.readyRows} devotees…`);
  const stats = await insertAll(supabase, parsed.rows);
  console.log("\n=== IMPORT COMPLETE ===");
  console.log(stats);

  const { count: devoteeCount, error: countError } = await supabase
    .from("devotees")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(countError.message);
  console.log(`Verify devotees count: ${devoteeCount}`);

  const sampleNames = ["NGUYỄN THANH LÂN", "LÊ THỊ THANH VÂN", "NGUYỄN THỊ THU HƯƠNG"];
  for (const name of sampleNames) {
    const { data, error } = await supabase
      .from("devotees")
      .select("id,full_name,dharma_name,family_registry_no,birth_date")
      .ilike("full_name", name)
      .limit(1);
    if (error) throw new Error(error.message);
    console.log(`Sample ${name}:`, data?.[0] ?? "(not found)");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
