import type { Metadata } from "next";

import { DevoteeCsvImportPageClient } from "@/components/devotees/DevoteeCsvImportPageClient";

export const metadata: Metadata = {
  title: "Import CSV",
  description: "Import temple devotee records from CSV",
};

export default function DevoteeImportPage() {
  return <DevoteeCsvImportPageClient />;
}
