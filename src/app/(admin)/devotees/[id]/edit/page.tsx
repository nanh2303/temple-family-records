import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DevoteeForm } from "@/components/devotees/DevoteeForm";
import { fetchDevoteeProfile } from "@/lib/data/devotee-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchDevoteeProfile(id);
  if (!profile) {
    return { title: "Not found" };
  }

  return { title: `Chỉnh sửa ${profile.devotee.full_name}` };
}

export default async function EditDevoteePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await fetchDevoteeProfile(id);
  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <div className="border-b border-border/80 pb-5">
        <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Cập nhật thông tin</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Chỉnh sửa hồ sơ</h1>
        <p className="mt-2 text-sm text-muted-foreground">{profile.devotee.full_name}</p>
      </div>
      <DevoteeForm
        mode="edit"
        devoteeId={profile.devotee.id}
        initialValues={{
          ...profile.devotee,
          death_date: profile.afterlife?.death_date,
          grave_location: profile.afterlife?.grave_location,
          afterlife_note: profile.afterlife?.note,
          training: profile.training,
          roles: profile.roles,
          notes: profile.notes,
        }}
        cancelHref={`/devotees/${id}`}
      />
    </div>
  );
}
