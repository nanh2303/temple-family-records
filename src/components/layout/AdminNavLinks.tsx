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
    <nav
      className="order-3 -mx-1 flex basis-full gap-1 border-t border-border/70 pt-1 text-sm sm:order-2 sm:mx-0 sm:basis-auto sm:border-0 sm:pt-0"
      aria-label="Điều hướng chính"
    >
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-sm px-2 py-2 text-xs transition-colors duration-150 sm:px-3 sm:text-sm",
              isActive
                ? "border-b-2 border-primary font-medium text-primary"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
