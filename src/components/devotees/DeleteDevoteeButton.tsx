"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type DeleteDevoteeButtonProps = {
  devoteeId: string;
};

export function DeleteDevoteeButton({ devoteeId }: DeleteDevoteeButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteDevotee() {
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

      setOpen(false);
      router.push("/devotees");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa hồ sơ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden />
        Xóa
      </Button>

      <Modal
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="Xóa hồ sơ đạo hữu"
        description="Bạn có chắc muốn xóa hồ sơ này? Thao tác này không thể hoàn tác."
      >
        {error ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button type="button" variant="destructive" onClick={() => void deleteDevotee()} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa hồ sơ"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
