import Link from "next/link";

import { AdminSignOutButton } from "@/components/auth/AdminSignOutButton";
import { AdminNavLinks } from "@/components/layout/AdminNavLinks";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 shadow-sm shadow-zinc-900/5 backdrop-blur-md">
      <div className="accent-bar h-0.5 w-full" />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-tight text-zinc-900 transition-colors hover:text-amber-800"
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
