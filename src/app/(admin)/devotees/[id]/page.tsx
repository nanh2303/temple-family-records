import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DevoteeProfileSection, ProfileField, profileBasics } from "@/components/devotees/DevoteeProfileCard";
import { PrintDevoteeButton } from "@/components/devotees/PrintDevoteeButton";
import { Button } from "@/components/ui/button";
import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";

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

  const longTerm = training.filter((t) => t.category === "long_term");
  const camps = training.filter((t) => t.category === "camp");
  const capDaTho = training.filter((t) => t.category === "ordination_level");
  const achievements = notes.filter((n) => n.note_type === "achievement");
  const comments = notes.filter((n) => n.note_type === "comment");
  const otherNotes = notes.filter((n) => n.note_type === "other");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{devotee.full_name}</h1>
          {devotee.dharma_name ? <p className="text-sm text-zinc-600">Pháp danh: {devotee.dharma_name}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <PrintDevoteeButton devoteeId={devotee.id} />
          <Button asChild variant="outline">
            <Link href="/devotees">← Quay lại tìm kiếm</Link>
          </Button>
        </div>
      </div>

      <DevoteeProfileSection title="Lý lịch">{profileBasics(devotee)}</DevoteeProfileSection>

      <DevoteeProfileSection title="Tu học trường kỳ">
        {longTerm.length === 0 ? (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {longTerm.map((t) => (
              <li key={t.id}>
                {t.title}
                {t.completed_date ? ` — ${t.completed_date}` : ""}
                {t.decision_no ? ` (${t.decision_no})` : ""}
              </li>
            ))}
          </ul>
        )}
      </DevoteeProfileSection>

      <DevoteeProfileSection title="Trại huấn luyện">
        {camps.length === 0 ? (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {camps.map((t) => (
              <li key={t.id}>
                {t.title}
                {t.completed_date ? ` — ${t.completed_date}` : ""}
              </li>
            ))}
          </ul>
        )}
      </DevoteeProfileSection>

      <DevoteeProfileSection title="Cấp đã thọ">
        {capDaTho.length === 0 ? (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        ) : (
          <ul className="list-inside list-disc space-y-1">
            {capDaTho.map((t) => (
              <li key={t.id}>
                {t.title}
                {t.completed_date ? ` — ${t.completed_date}` : ""}
              </li>
            ))}
          </ul>
        )}
      </DevoteeProfileSection>

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

      <DevoteeProfileSection title="Hậu thế">
        {afterlife ? (
          <>
            <ProfileField label="Ngày mất" value={afterlife.death_date} />
            <ProfileField label="Nơi an táng / mộ phần" value={afterlife.grave_location} />
            <ProfileField label="Ghi chú" value={afterlife.note} />
          </>
        ) : (
          <p className="text-zinc-500">Chưa có dữ liệu.</p>
        )}
      </DevoteeProfileSection>
    </div>
  );
}
