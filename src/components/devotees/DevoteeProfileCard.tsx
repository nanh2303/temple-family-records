import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DevoteeAfterlifeInfo, DevoteeRecord } from "@/types/devotee";

type DevoteeProfileCardProps = {
  title: string;
  children: React.ReactNode;
};

export function DevoteeProfileSection({ title, children }: DevoteeProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle className="text-base font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-stone-700">{children}</CardContent>
    </Card>
  );
}

type FieldProps = { label: string; value: string | null | undefined };

export function ProfileField({ label, value }: FieldProps) {
  return (
    <div className="border-b border-border/60 px-2 py-3 last:border-0">
      <span className="block text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className="mt-1 block text-sm text-foreground">{value && String(value).length > 0 ? value : "—"}</span>
    </div>
  );
}

type ProfilePictureProps = { url: string | null | undefined };

export function ProfilePicture({ url }: ProfilePictureProps) {
  if (!url) return null;
  return (
    <div className="flex justify-center pb-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Ảnh đại diện"
        className="size-32 rounded-md object-cover ring-1 ring-border"
      />
    </div>
  );
}

export function profileBasics(devotee: DevoteeRecord, afterlife?: DevoteeAfterlifeInfo | null) {
  return (
    <div className="grid gap-x-8 sm:grid-cols-2">
      {devotee.profile_picture_url ? (
        <div className="sm:col-span-2">
          <ProfilePicture url={devotee.profile_picture_url} />
        </div>
      ) : null}
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
      <ProfileField label="Đang Sinh Hoạt" value={devotee.current_unit_status} />
      <ProfileField label="Đang Học Bậc" value={devotee.current_study_level} />
      <ProfileField label="Tạ thế ngày" value={afterlife?.death_date} />
      <ProfileField label="Mộ chí tại" value={afterlife?.grave_location} />
    </div>
  );
}
