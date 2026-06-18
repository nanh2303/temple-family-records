import type { Metadata } from "next";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteDevoteeButton } from "@/components/devotees/DeleteDevoteeButton";
import { DevoteeProfileSection, profileBasics } from "@/components/devotees/DevoteeProfileCard";
import { PrintFormSelectorButton } from "@/components/devotees/PrintFormSelectorButton";
import { Button } from "@/components/ui/button";
import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";
import {
  DEVOTEE_TRAINING_CATEGORIES,
  DEVOTEE_TRAINING_RECORD_DEFINITIONS,
  getTrainingRecordDefinitionForRecord,
  type DevoteeTrainingCategory,
  type DevoteeTrainingRecordKey,
} from "@/lib/devotees/profile-sections";
import type { DevoteeTrainingRecord } from "@/types/devotee";

const TRAINING_CATEGORY_ORDER: DevoteeTrainingCategory[] = ["long_term", "camp", "ordination_level"];

function buildTrainingRecordMap(training: DevoteeTrainingRecord[]) {
  const byKey = new Map<DevoteeTrainingRecordKey, DevoteeTrainingRecord>();
  const custom: DevoteeTrainingRecord[] = [];

  for (const record of training) {
    const definition = getTrainingRecordDefinitionForRecord(record);
    if (definition) {
      byKey.set(definition.key, record);
    } else {
      custom.push(record);
    }
  }

  return { byKey, custom };
}

function TrainingRows({
  category,
  records,
}: {
  category: DevoteeTrainingCategory;
  records: Map<DevoteeTrainingRecordKey, DevoteeTrainingRecord>;
}) {
  const definitions = DEVOTEE_TRAINING_RECORD_DEFINITIONS.filter((definition) => definition.category === category);
  return (
    <div className="space-y-2">
      {definitions.map((definition) => {
        const record = records.get(definition.key);
        return (
          <div
            key={definition.key}
            className="grid gap-1 border-b border-zinc-100 pb-2 last:border-0 sm:grid-cols-[12rem_1fr_1fr]"
          >
            <span className="font-medium text-zinc-900">{definition.label}</span>
            <span>Ngày: {record?.completed_date ?? "—"}</span>
            <span>Quyết định số: {record?.decision_no ?? "—"}</span>
          </div>
        );
      })}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchDevoteeProfile(id);
  if (!profile) {
    return { title: "Not found" };
  }
  return { title: profile.devotee.full_name };
}

export default async function DevoteeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await fetchDevoteeProfile(id);
  if (!profile) {
    notFound();
  }

  const { devotee, training, roles, notes, afterlife } = profile;
  const trainingRecordMap = buildTrainingRecordMap(training);
  const achievements = notes.filter((n) => n.note_type === "achievement");
  const comments = notes.filter((n) => n.note_type === "comment");
  const otherNotes = notes.filter((n) => n.note_type === "other");

  return (
    <div className="space-y-6">
      <div className="glass-panel sticky top-14 z-10 -mx-4 rounded-none border-b border-zinc-200/80 px-4 py-4 shadow-sm sm:-mx-0 sm:rounded-xl sm:border sm:shadow-md sm:shadow-zinc-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="animate-slide-down">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{devotee.full_name}</h1>
            {devotee.dharma_name ? (
              <p className="mt-1 text-sm text-amber-800/80">Pháp danh: {devotee.dharma_name}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <Button asChild variant="outline">
              <Link href="/devotees">
                <ArrowLeft aria-hidden />
                Quay lại
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/devotees/${devotee.id}/edit`}>
                <Pencil aria-hidden />
                Chỉnh sửa
              </Link>
            </Button>
            <DeleteDevoteeButton devoteeId={devotee.id} />
            <PrintFormSelectorButton devoteeId={devotee.id} />
          </div>
        </div>
      </div>

      <DevoteeProfileSection title="Lý lịch">{profileBasics(devotee, afterlife)}</DevoteeProfileSection>

      {TRAINING_CATEGORY_ORDER.map((category) => (
        <DevoteeProfileSection key={category} title={DEVOTEE_TRAINING_CATEGORIES[category]}>
          <TrainingRows category={category} records={trainingRecordMap.byKey} />
        </DevoteeProfileSection>
      ))}

      {trainingRecordMap.custom.length > 0 ? (
        <DevoteeProfileSection title="Tu học / huấn luyện khác">
          <ul className="list-inside list-disc space-y-1">
            {trainingRecordMap.custom.map((t) => (
              <li key={t.id}>
                {t.title}
                {t.completed_date ? ` — ${t.completed_date}` : ""}
                {t.decision_no ? ` (${t.decision_no})` : ""}
              </li>
            ))}
          </ul>
        </DevoteeProfileSection>
      ) : null}

      <DevoteeProfileSection title="Chức vụ từng đảm nhận">
        {roles.length === 0 ? (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        ) : (
          <ul className="space-y-2">
            {roles.map((r) => (
              <li key={r.id} className="border-b border-zinc-100 pb-2 last:border-0">
                <p className="font-medium text-zinc-900">{r.role_title}</p>
                {r.organization ? <p className="text-zinc-600">{r.organization}</p> : null}
                <p className="text-xs text-zinc-500">
                  {r.start_date ?? "?"} — {r.end_date ?? "?"}
                  {r.note ? ` — ${r.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DevoteeProfileSection>

      <DevoteeProfileSection title="Thành tích cá nhân">
        {achievements.length === 0 ? (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {achievements.map((n) => (
              <li key={n.id}>{n.content}</li>
            ))}
          </ul>
        )}
      </DevoteeProfileSection>

      <DevoteeProfileSection title="Nhận xét khác">
        {comments.length === 0 && otherNotes.length === 0 ? (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        ) : (
          <ul className="space-y-2">
            {[...comments, ...otherNotes].map((n) => (
              <li key={n.id} className="whitespace-pre-wrap">
                {n.content}
              </li>
            ))}
          </ul>
        )}
      </DevoteeProfileSection>
    </div>
  );
}

