"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type DeleteDevoteeButtonProps = {
  devoteeId: string;
};

export function DeleteDevoteeButton({ devoteeId }: DeleteDevoteeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteDevotee() {
    const confirmed = window.confirm("Bạn có chắc muốn xóa hồ sơ Phật tử này? Thao tác này không thể hoàn tác.");
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/devotees/${devoteeId}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? `Request failed (${response.status})`);
      }

      router.push("/devotees");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button type="button" variant="outline" onClick={() => void deleteDevotee()} disabled={loading}>
        <Trash2 aria-hidden />
        {loading ? "Đang xóa..." : "Xóa"}
      </Button>
      {error ? (
        <p className="max-w-xs text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
