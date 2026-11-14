"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

const MOBILE_ITEMS = [
  ...NAV_ITEMS.map((i) => {
    if (i.label === "Tableau de bord") return { ...i, label: "Accueil" };
    if (i.label === "Liste de courses") return { ...i, label: "Courses" };
    return i;
  }),
  { href: "/profile", label: "Profil", icon: "👤" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface md:hidden"
    >
      {MOBILE_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[12px] ${
              active ? "text-accent" : "text-foreground-secondary"
            }`}
          >
            <span aria-hidden="true" className="text-base">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
