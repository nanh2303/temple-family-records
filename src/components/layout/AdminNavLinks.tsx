"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Trang điều khiển" },
  { href: "/devotees", label: "Đạo hữu" },
] as const;

export function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm" aria-label="Main">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-lg px-3 py-1.5 transition-all duration-200",
              isActive
                ? "bg-amber-50 font-semibold text-amber-900 shadow-sm ring-1 ring-amber-200/60"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
