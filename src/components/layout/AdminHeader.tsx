import Link from "next/link";

import { AdminSignOutButton } from "@/components/auth/AdminSignOutButton";
import { AdminNavLinks } from "@/components/layout/AdminNavLinks";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/90 bg-card/90 shadow-sm shadow-stone-900/5 backdrop-blur-md">
      <div className="accent-bar h-0.5 w-full" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            Hồ sơ nhà chùa
          </Link>
          <AdminNavLinks />
        </div>
        <AdminSignOutButton />
      </div>
    </header>
  );
}
