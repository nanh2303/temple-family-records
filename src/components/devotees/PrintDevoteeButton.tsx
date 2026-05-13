"use client";

import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";

type PrintDevoteeButtonProps = {
  devoteeId: string;
};

export function PrintDevoteeButton({ devoteeId }: PrintDevoteeButtonProps) {
  const href = `/api/pdf/devotees/${devoteeId}`;

  return (
    <Button asChild variant="secondary">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <FileDown aria-hidden />
        In / PDF (Mẫu Gia Phả)
      </a>
    </Button>
  );
}
