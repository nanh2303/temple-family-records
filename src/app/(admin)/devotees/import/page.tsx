import type { Metadata } from "next";

import { DevoteeCsvImportPageClient } from "@/components/devotees/DevoteeCsvImportPageClient";

export const metadata: Metadata = {
  title: "Import CSV và Excel",
  description: "Import temple devotee records from CSV or Excel",
};

export default function DevoteeImportPage() {
  return <DevoteeCsvImportPageClient />;
}
