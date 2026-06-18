"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-4 py-6 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "animate-scale-in w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-stone-900/20",
          className,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="accent-bar h-1 w-full" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-foreground">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Đóng" onClick={onClose}>
              <X aria-hidden />
            </Button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
