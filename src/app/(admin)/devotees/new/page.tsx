import type { Metadata } from "next";

import { DevoteeForm } from "@/components/devotees/DevoteeForm";

export const metadata: Metadata = {
  title: "Thêm Phật tử",
  description: "Create a new devotee record",
};

export default function NewDevoteePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Thêm Phật tử</h1>
        <p className="mt-1 text-sm text-zinc-600">Tạo hồ sơ danh bộ mới.</p>
      </div>
      <DevoteeForm mode="create" cancelHref="/devotees" />
    </div>
  );
}
