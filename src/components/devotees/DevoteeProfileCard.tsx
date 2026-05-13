import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DevoteeRecord } from "@/types/devotee";

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

export function profileBasics(devotee: DevoteeRecord) {
  return (
    <>
      <ProfileField label="Số hồ sơ gia phả" value={devotee.family_registry_no} />
      <ProfileField label="Số hồ sơ BHD" value={devotee.bhd_registry_no} />
      <ProfileField label="Họ tên" value={devotee.full_name} />
      <ProfileField label="Ngày sinh" value={devotee.birth_date} />
      <ProfileField label="Nơi sinh" value={devotee.birth_place} />
      <ProfileField label="Pháp danh" value={devotee.dharma_name} />
      <ProfileField label="Địa chỉ" value={devotee.address} />
      <ProfileField label="Quê quán" value={devotee.hometown} />
      <ProfileField label="Ngày vào đơn vị" value={devotee.joined_unit_date} />
      <ProfileField label="Ngày phát nguyện" value={devotee.vow_date} />
      <ProfileField label="Ngày quy y" value={devotee.refuge_date} />
      <ProfileField label="Đạo hữu/Thầy quy y" value={devotee.preceptor} />
      <ProfileField label="Cha" value={devotee.father_name} />
      <ProfileField label="Mẹ" value={devotee.mother_name} />
    </>
  );
}
