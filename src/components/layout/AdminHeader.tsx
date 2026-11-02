import Link from "next/link";
import { Flower2 } from "lucide-react";

import { AdminSignOutButton } from "@/components/auth/AdminSignOutButton";
import { AdminNavLinks } from "@/components/layout/AdminNavLinks";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d1c2] bg-[#f8f4eb]/95">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 sm:min-h-[4.5rem] sm:flex-nowrap sm:px-6 sm:py-0">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5 text-foreground">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-[#ead7ad]">
            <Flower2 className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">Hồ sơ nhà chùa</span>
            <span className="mt-0.5 hidden text-[0.63rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Sổ gia đình Phật tử
            </span>
          </span>
        </Link>
        <AdminSignOutButton />
        <AdminNavLinks />
      </div>
    </header>
  );
}
