"use client";

import { Search } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DevoteeSearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

export function DevoteeSearchBox({ value, onChange, className, disabled, loading }: DevoteeSearchBoxProps) {
  const id = useId();

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="sr-only">
        Tìm đạo hữu
      </Label>
      <div className={cn("search-glow relative rounded-lg transition-shadow duration-200", loading && "animate-pulse-soft")}>
        <Search
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 transition-colors",
            value && "text-amber-600",
          )}
          aria-hidden
        />
        <Input
          id={id}
          className="h-12 pl-10 text-base shadow-sm"
          placeholder="Ví dụ: Dung Quảng Ngãi, Tâm Đức, số hồ sơ…"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {loading ? (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-amber-700"
            role="status"
          >
            Đang tìm…
          </span>
        ) : null}
      </div>
    </div>
  );
}
