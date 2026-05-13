"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DevoteeSearchBox } from "@/components/devotees/DevoteeSearchBox";
import { Button } from "@/components/ui/button";

export function DashboardSearchLaunch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function goSearch() {
    const q = query.trim();
    if (q) {
      router.push(`/devotees?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/devotees");
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <DevoteeSearchBox value={query} onChange={setQuery} className="flex-1" />
      <Button type="button" className="sm:w-32" onClick={goSearch}>
        Tìm
      </Button>
    </div>
  );
}
