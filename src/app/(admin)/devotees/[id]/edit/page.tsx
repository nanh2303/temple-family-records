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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Chỉnh sửa hồ sơ</h1>
        <p className="mt-1 text-sm text-zinc-600">{profile.devotee.full_name}</p>
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
