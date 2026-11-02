import type { Metadata } from "next";

import { DevoteeForm } from "@/components/devotees/DevoteeForm";

export const metadata: Metadata = {
  title: "Thêm Phật tử",
  description: "Create a new devotee record",
};

export default function NewDevoteePage() {
  return (
    <div className="space-y-7">
      <div className="border-b border-border/80 pb-5">
        <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Sổ gia đình Phật tử</p>
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Thêm đạo hữu</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tạo hồ sơ danh bộ mới.</p>
      </div>
      <DevoteeForm mode="create" cancelHref="/devotees" />
    </div>
  );
}
