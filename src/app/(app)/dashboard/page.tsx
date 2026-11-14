"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { calendar, shopping, stock } from "@/lib/api";
import { toIsoDate } from "@/lib/date";
import {
  formatLongDate,
  formatShoppingListTitle,
  MEAL_SLOT_LABEL,
} from "@/lib/format";
import type { CalendarEntry, ShoppingList } from "@/lib/types";

export default function DashboardPage() {
  const [todayEntries, setTodayEntries] = useState<CalendarEntry[] | null>(
    null,
  );
  const [calendarError, setCalendarError] = useState(false);

  const [expiringCount, setExpiringCount] = useState<number | null>(null);
  const [stockError, setStockError] = useState(false);

  const [activeList, setActiveList] = useState<ShoppingList | null | undefined>(
    undefined,
  );
  const [shoppingError, setShoppingError] = useState(false);

  useEffect(() => {
    const today = toIsoDate(new Date());

    calendar
      .range(today, today)
      .then((entries) => {
        setTodayEntries(entries);
        setCalendarError(false);
      })
      .catch(() => {
        setTodayEntries([]);
        setCalendarError(true);
      });

    stock
      .list(true)
      .then((s) => {
        setExpiringCount(s.length);
        setStockError(false);
      })
      .catch(() => {
        setExpiringCount(null);
        setStockError(true);
      });

    shopping
      .list()
      .then((lists) => {
        const found = lists.find((l) => !l.validated) ?? null;
        setActiveList(found);
        setShoppingError(false);
      })
      .catch(() => {
        setActiveList(null);
        setShoppingError(true);
      });
  }, []);

  const slots: Array<"MIDI" | "SOIR"> = ["MIDI", "SOIR"];

  return (
    <div className="flex flex-col gap-8">
      {/* En-tête */}
      <p className="font-heading text-2xl font-medium">{formatLongDate()}</p>

      {/* Repas du jour */}
      <section aria-labelledby="heading-repas">
        <h2
          id="heading-repas"
          className="mb-3 font-heading text-lg font-medium"
        >
          Repas du jour
        </h2>

        {calendarError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            Impossible de charger les repas du jour.
          </p>
        )}

        {todayEntries === null && !calendarError && (
          <p className="text-sm text-foreground-secondary">Chargement…</p>
        )}

        {todayEntries !== null && (
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
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-3 text-sm text-foreground hover:border-border-strong"
                  >
                    <span aria-hidden="true">+</span> Planifier
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Alerte stock périmé — visible uniquement si expiringCount >= 1 */}
      {stockError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          Impossible de charger les informations de stock.
        </p>
      )}

      {expiringCount !== null && expiringCount >= 1 && (
        <section aria-labelledby="heading-stock">
          <Card>
            <h2
              id="heading-stock"
              className="mb-2 font-heading text-lg font-medium"
            >
              Stock
            </h2>
            <p className="mb-4 text-sm text-foreground-secondary">
              {expiringCount} article{expiringCount > 1 ? "s" : ""} bientôt
              périmé{expiringCount > 1 ? "s" : ""}
            </p>
            <Link
              href="/stock"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-3 text-sm text-foreground hover:border-border-strong"
            >
              Voir le stock
            </Link>
          </Card>
        </section>
      )}

      {/* Liste de courses en cours — visible uniquement si activeList existe */}
      {shoppingError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          Impossible de charger la liste de courses.
        </p>
      )}

      {activeList === undefined && !shoppingError && (
        <p className="text-sm text-foreground-secondary">Chargement…</p>
      )}

      {activeList !== null && activeList !== undefined && (
        <section aria-labelledby="heading-courses">
          <Card>
            <h2
              id="heading-courses"
              className="mb-2 font-heading text-lg font-medium"
            >
              Liste de courses
            </h2>
            <p className="mb-4 text-sm text-foreground-secondary">
              {formatShoppingListTitle(
                activeList.periodStart,
                activeList.periodEnd,
              )}
            </p>
            <Link
              href="/shopping"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-3 text-sm text-foreground hover:border-border-strong"
            >
              Voir la liste
            </Link>
          </Card>
        </section>
      )}
    </div>
  );
}
