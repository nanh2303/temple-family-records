import type { Metadata } from "next";

import { DevoteesSearchPageClient } from "@/components/devotees/DevoteesSearchPageClient";

export const metadata: Metadata = {
  title: "Devotees",
  description: "Search temple devotee records",
};

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DevoteesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  return <DevoteesSearchPageClient key={q} initialQuery={q} />;
}
