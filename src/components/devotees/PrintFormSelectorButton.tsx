"use client";

import { FileDown, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { FORM_TEMPLATES, type FormTemplateDefinition } from "@/lib/pdf/formTemplates";

type PrintFormSelectorButtonProps = {
  devoteeId: string;
};

export function PrintFormSelectorButton({ devoteeId }: PrintFormSelectorButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function selectTemplate(template: FormTemplateDefinition) {
    window.open(`/api/pdf/devotees/${devoteeId}?template=${encodeURIComponent(template.id)}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <FileDown aria-hidden />
        In
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4 py-6" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="text-lg font-semibold tracking-tight text-zinc-900">
                  Chọn mẫu để in
                </h2>
                <p className="mt-1 text-sm text-zinc-600">Chọn biểu mẫu PDF cần điền cho hồ sơ này.</p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label="Đóng" onClick={() => setOpen(false)}>
                <X aria-hidden />
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {FORM_TEMPLATES.length === 0 ? (
                <p className="text-sm text-zinc-600">Chưa có mẫu in khả dụng.</p>
              ) : (
                FORM_TEMPLATES.map((template) => (
                  <div key={template.id} className="rounded-md border border-zinc-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-900">{template.name}</h3>
                        <p className="mt-1 text-sm text-zinc-600">{template.description}</p>
                      </div>
                      <Button type="button" size="sm" onClick={() => selectTemplate(template)}>
                        Chọn mẫu này
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
