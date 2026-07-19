"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { useAuth } from "@/lib/auth-context";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden w-60 shrink-0 flex-col justify-between border-r border-border bg-surface px-4 py-6 md:flex"
    >
      <div>
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent"
          >
            🧑‍🍳
          </span>
          <span className="font-heading text-base font-medium">
            Cook<span className="text-accent">that</span>One
          </span>
        </Link>
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-foreground-secondary hover:bg-surface-raised hover:text-foreground"
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Link
          href="/profile"
          aria-current={pathname === "/profile" ? "page" : undefined}
          className="truncate rounded-lg px-3 py-2 text-sm text-foreground-secondary hover:text-foreground"
        >
          {user?.email ?? "…"}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
