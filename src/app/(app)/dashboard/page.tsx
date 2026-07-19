"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { calendar, recipes, stock } from "@/lib/api";
import { formatLongDate, MEAL_SLOT_LABEL, todayIso } from "@/lib/format";
import { NAV_ITEMS } from "@/components/nav/nav-items";
import type { CalendarEntry } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayEntries, setTodayEntries] = useState<CalendarEntry[]>([]);
  const [recipeCount, setRecipeCount] = useState<number | null>(null);
  const [stockCount, setStockCount] = useState<number | null>(null);
  const [expiringCount, setExpiringCount] = useState<number | null>(null);

  useEffect(() => {
    const today = todayIso();
    calendar
      .range(today, today)
      .then(setTodayEntries)
      .catch(() => setTodayEntries([]));
    recipes
      .list()
      .then((r) => setRecipeCount(r.length))
      .catch(() => setRecipeCount(null));
    stock
      .list()
      .then((s) => setStockCount(s.length))
      .catch(() => setStockCount(null));
    stock
      .list(true)
      .then((s) => setExpiringCount(s.length))
      .catch(() => setExpiringCount(null));
  }, []);

  const slots: Array<"MIDI" | "SOIR"> = ["MIDI", "SOIR"];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-foreground-secondary">{formatLongDate()}</p>
        <h1 className="font-heading text-2xl font-medium">
          Bonjour chef <span className="text-accent">{user?.pseudo}</span>{" "}
          <span aria-hidden="true">👋</span>
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {slots.map((slot) => {
          const entry = todayEntries.find((e) => e.mealSlot === slot);
          return (
            <Card key={slot}>
              <p className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">
                {MEAL_SLOT_LABEL[slot]}
              </p>
              <p className="mt-2 mb-4 text-sm">
                {entry?.recipe?.title ?? "Aucun repas planifié"}
              </p>
              <Link
                href="/calendar"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-border-strong"
              >
                <span aria-hidden="true">+</span> Planifier
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="📖" value={recipeCount} label="Recettes" />
        <StatCard icon="📦" value={stockCount} label="En stock" />
        <StatCard
          icon="⚠️"
          value={expiringCount}
          label="Périmés bientôt"
          tone={expiringCount ? "warning" : undefined}
        />
      </div>

      <div>
        <h2 className="mb-3 font-heading text-lg font-medium">Accès rapide</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {NAV_ITEMS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-5 text-sm text-foreground-secondary hover:border-border-strong hover:text-foreground"
            >
              <span aria-hidden="true" className="text-xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: string;
  value: number | null;
  label: string;
  tone?: "warning";
}) {
  return (
    <Card className="flex flex-col gap-1">
      <span aria-hidden="true" className="text-lg">
        {icon}
      </span>
      <p
        className={`font-heading text-2xl font-medium ${
          tone === "warning" && value ? "text-accent" : ""
        }`}
      >
        {value ?? "–"}
      </p>
      <p className="text-sm text-foreground-secondary">{label}</p>
    </Card>
  );
}
