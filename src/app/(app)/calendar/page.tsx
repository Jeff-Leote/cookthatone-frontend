"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MealSlotCell } from "@/components/calendar/MealSlotCell";
import { RecipePickerDialog } from "@/components/calendar/RecipePickerDialog";
import { MoveMealDialog } from "@/components/calendar/MoveMealDialog";
import { ApiError, calendar, recipes as recipesApi } from "@/lib/api";
import {
  addDays,
  formatWeekRange,
  getWeekDays,
  getWeekStart,
  toIsoDate,
  type WeekDay,
} from "@/lib/date";
import { MEAL_SLOT_LABEL } from "@/lib/format";
import type { CalendarEntry, MealSlot, Recipe } from "@/lib/types";

type PlanTarget = { iso: string; slot: MealSlot };

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [entries, setEntries] = useState<CalendarEntry[] | null>(null);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [planTarget, setPlanTarget] = useState<PlanTarget | null>(null);
  const [moveEntry, setMoveEntry] = useState<CalendarEntry | null>(null);
  const [validateEntry, setValidateEntry] = useState<CalendarEntry | null>(
    null,
  );

  const weekDays = getWeekDays(weekStart);

  const loadEntries = useCallback(() => {
    const from = toIsoDate(weekStart);
    const to = toIsoDate(addDays(weekStart, 6));
    calendar
      .range(from, to)
      .then((data) => {
        setEntries(data);
        setError(null);
      })
      .catch(() => setError("Impossible de charger le calendrier."));
  }, [weekStart]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    recipesApi
      .list()
      .then(setAllRecipes)
      .catch(() => setAllRecipes([]));
  }, []);

  function findEntry(day: WeekDay, slot: MealSlot) {
    return entries?.find(
      (e) => e.plannedDate.slice(0, 10) === day.iso && e.mealSlot === slot,
    );
  }

  async function handlePlan(recipeId: string) {
    if (!planTarget) return;
    try {
      await calendar.create({
        recipeId,
        plannedDate: planTarget.iso,
        mealSlot: planTarget.slot,
      });
      setPlanTarget(null);
      loadEntries();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de planifier ce repas.",
      );
      setPlanTarget(null);
    }
  }

  async function handleValidate(entry: CalendarEntry) {
    try {
      await calendar.validate(entry.id, { done: true });
      loadEntries();
    } catch {
      setError("Impossible de valider ce repas.");
    }
  }

  async function handleValidateDifferent(recipeId: string) {
    if (!validateEntry) return;
    try {
      await calendar.validate(validateEntry.id, {
        done: true,
        actualRecipeId: recipeId,
      });
      setValidateEntry(null);
      loadEntries();
    } catch {
      setError("Impossible de valider ce repas.");
      setValidateEntry(null);
    }
  }

  async function handleMove(iso: string, slot: MealSlot) {
    if (!moveEntry) return;
    try {
      await calendar.move(moveEntry.id, { plannedDate: iso, mealSlot: slot });
      setMoveEntry(null);
      loadEntries();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de déplacer ce repas.",
      );
      setMoveEntry(null);
    }
  }

  async function handleRemove(entry: CalendarEntry) {
    if (
      !window.confirm(
        `Retirer « ${entry.recipe?.title ?? "ce repas"} » du calendrier ?`,
      )
    ) {
      return;
    }
    try {
      await calendar.remove(entry.id);
      loadEntries();
    } catch {
      setError("Impossible de retirer ce repas.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-medium">Calendrier</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            aria-label="Semaine précédente"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            ←
          </Button>
          <span className="text-sm text-foreground-secondary">
            {formatWeekRange(weekStart)}
          </span>
          <Button
            type="button"
            variant="secondary"
            aria-label="Semaine suivante"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            →
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {entries === null && !error && (
        <p role="status" className="text-sm text-foreground-secondary">
          Chargement…
        </p>
      )}

      {entries !== null && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDays.map((day) => (
            <div key={day.iso} className="flex flex-col gap-2">
              <p
                className={`text-xs font-medium uppercase tracking-wide ${
                  day.isToday ? "text-accent" : "text-foreground-secondary"
                }`}
              >
                {day.label} {day.dayNumber}
              </p>
              {(["MIDI", "SOIR"] as MealSlot[]).map((slot) => {
                const entry = findEntry(day, slot);
                return (
                  <div key={slot} className="flex flex-col gap-1">
                    <p className="text-[10px] uppercase tracking-wide text-foreground-secondary">
                      {MEAL_SLOT_LABEL[slot]}
                    </p>
                    <MealSlotCell
                      entry={entry}
                      dayLabel={`${day.label} ${day.dayNumber}`}
                      slotLabel={MEAL_SLOT_LABEL[slot]}
                      onPlan={() => setPlanTarget({ iso: day.iso, slot })}
                      onValidate={() => entry && handleValidate(entry)}
                      onValidateDifferent={() =>
                        entry && setValidateEntry(entry)
                      }
                      onMove={() => entry && setMoveEntry(entry)}
                      onRemove={() => entry && handleRemove(entry)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <RecipePickerDialog
        open={planTarget !== null}
        title="Planifier une recette"
        recipes={allRecipes}
        onSelect={handlePlan}
        onClose={() => setPlanTarget(null)}
      />

      <RecipePickerDialog
        open={validateEntry !== null}
        title="Recette réellement cuisinée"
        recipes={allRecipes}
        onSelect={handleValidateDifferent}
        onClose={() => setValidateEntry(null)}
      />

      <MoveMealDialog
        open={moveEntry !== null}
        weekDays={weekDays}
        onSelect={handleMove}
        onClose={() => setMoveEntry(null)}
      />
    </div>
  );
}
