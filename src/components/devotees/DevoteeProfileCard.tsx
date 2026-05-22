import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DevoteeAfterlifeInfo, DevoteeRecord } from "@/types/devotee";

type DevoteeProfileCardProps = {
  title: string;
  children: React.ReactNode;
};

export function DevoteeProfileSection({ title, children }: DevoteeProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-zinc-700">{children}</CardContent>
    </Card>
  );
}

type FieldProps = { label: string; value: string | null | undefined };

export function ProfileField({ label, value }: FieldProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="min-w-[10rem] font-medium text-zinc-900">{label}</span>
      <span className="text-zinc-700">{value && String(value).length > 0 ? value : "—"}</span>
    </div>
  );
}

type ProfilePictureProps = { url: string | null | undefined };

export function ProfilePicture({ url }: ProfilePictureProps) {
  if (!url) return null;
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Profile picture"
        className="h-48 w-48 rounded-lg object-cover shadow-md"
      />
    </div>
  );
}

export function profileBasics(devotee: DevoteeRecord, afterlife?: DevoteeAfterlifeInfo | null) {
  return (
    <>
      {devotee.profile_picture_url ? <ProfilePicture url={devotee.profile_picture_url} /> : null}
      <ProfileField label="Số danh bộ gia đình" value={devotee.family_registry_no} />
      <ProfileField label="Số danh bộ BHD" value={devotee.bhd_registry_no} />
      <ProfileField label="Họ và tên" value={devotee.full_name} />
      <ProfileField label="Ngày tháng năm sinh" value={devotee.birth_date} />
      <ProfileField label="Nơi sinh" value={devotee.birth_place} />
      <ProfileField label="Pháp danh" value={devotee.dharma_name} />
      <ProfileField label="Địa chỉ" value={devotee.address} />
      <ProfileField label="Quê quán" value={devotee.hometown} />
      <ProfileField label="Ngày vào Đơn vị" value={devotee.joined_unit_date} />
      <ProfileField label="Ngày Phát nguyện" value={devotee.vow_date} />
      <ProfileField label="Ngày Quy y" value={devotee.refuge_date} />
      <ProfileField label="Bổn Sư truyền giới" value={devotee.preceptor} />
      <ProfileField label="Tên Cha" value={devotee.father_name} />
      <ProfileField label="Tên Mẹ" value={devotee.mother_name} />
      <ProfileField label="Tạ thế ngày" value={afterlife?.death_date} />
      <ProfileField label="Mộ chí tại" value={afterlife?.grave_location} />
      {afterlife?.note ? <ProfileField label="Ghi chú (hậu thế)" value={afterlife.note} /> : null}
    </>
  );
}
