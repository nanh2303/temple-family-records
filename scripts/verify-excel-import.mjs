import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const eq = trimmed.indexOf("=");
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const counts = {};
for (const table of [
  "devotees",
  "devotee_training_records",
  "devotee_roles",
  "devotee_notes",
  "devotee_afterlife_info",
]) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  counts[table] = count;
}
console.log("counts", counts);

const { data: d, error: dErr } = await supabase
  .from("devotees")
  .select("id,full_name,dharma_name,refuge_date,vow_date,preceptor,family_registry_no")
  .ilike("full_name", "LÊ THỊ THANH VÂN")
  .limit(1);
if (dErr) throw new Error(dErr.message);
const person = d?.[0];
console.log("profile", person);

const { data: training } = await supabase
  .from("devotee_training_records")
  .select("record_key,category,title,completed_date,decision_no")
  .eq("devotee_id", person.id)
  .order("title");
const { data: roles } = await supabase
  .from("devotee_roles")
  .select("role_title,organization")
  .eq("devotee_id", person.id);
console.log("training count", training?.length ?? 0);
console.log(training);
console.log("roles", roles);

const { data: fake } = await supabase
  .from("devotees")
  .select("full_name")
  .in("full_name", ["Nguyễn Văn Dũng", "Trần Thị Mai", "Lê Hoàng Phát"]);
console.log("fake remaining", fake);

const { data: searchRows, error: searchErr } = await supabase.rpc("search_devotees", {
  query_text: "Thanh Lan",
});
if (searchErr) throw new Error(searchErr.message);
console.log(
  "search Thanh Lan",
  (searchRows ?? []).slice(0, 3).map((r) => ({ full_name: r.full_name, dharma_name: r.dharma_name })),
);
