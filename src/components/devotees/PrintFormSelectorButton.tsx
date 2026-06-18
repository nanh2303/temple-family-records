"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FORM_TEMPLATES, type FormTemplateDefinition } from "@/lib/pdf/formTemplates";

type PrintFormSelectorButtonProps = {
  devoteeId: string;
};

export function PrintFormSelectorButton({ devoteeId }: PrintFormSelectorButtonProps) {
  const [open, setOpen] = useState(false);

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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Chọn mẫu để in"
        description="Chọn biểu mẫu PDF cần điền cho hồ sơ này."
      >
        <div className="space-y-3">
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
      </Modal>
    </>
  );
}
