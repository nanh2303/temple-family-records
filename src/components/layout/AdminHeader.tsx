import Link from "next/link";

import { AdminSignOutButton } from "@/components/auth/AdminSignOutButton";

export function AdminHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-semibold text-zinc-900">
            Temple records
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600" aria-label="Main">
            <Link href="/dashboard" className="hover:text-zinc-900">
              Dashboard
            </Link>
            <Link href="/devotees" className="hover:text-zinc-900">
              Devotees
            </Link>
          </nav>
        </div>
        <AdminSignOutButton />
      </div>
    </header>
  );
}
