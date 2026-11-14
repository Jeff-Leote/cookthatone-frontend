"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MealSlotCell } from "@/components/calendar/MealSlotCell";
import { RecipePickerDialog } from "@/components/calendar/RecipePickerDialog";
import { PortionsDialog } from "@/components/calendar/PortionsDialog";
import { MoveMealDialog } from "@/components/calendar/MoveMealDialog";
import { ApiError, calendar } from "@/lib/api";
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
  const [error, setError] = useState<string | null>(null);

  const [planTarget, setPlanTarget] = useState<PlanTarget | null>(null);
  const [planRecipe, setPlanRecipe] = useState<Recipe | null>(null);
  const [moveEntry, setMoveEntry] = useState<CalendarEntry | null>(null);
  const [validateEntry, setValidateEntry] = useState<CalendarEntry | null>(
    null,
  );

  const weekDays = getWeekDays(weekStart);

  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(weekStart);

  const resolvedSelectedDayIso = (() => {
    const todayIso = toIsoDate(new Date());
    const inWeek = weekDays.some((d) => d.iso === todayIso);
    const defaultIso = inWeek ? todayIso : weekDays[0].iso;
    if (selectedWeekStart.getTime() !== weekStart.getTime()) {
      return defaultIso;
    }
    return selectedDayIso ?? defaultIso;
  })();

  function handleSelectDay(iso: string) {
    setSelectedDayIso(iso);
    setSelectedWeekStart(weekStart);
  }

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

  function findEntry(day: WeekDay, slot: MealSlot) {
    return entries?.find(
      (e) => e.plannedDate.slice(0, 10) === day.iso && e.mealSlot === slot,
    );
  }

  function handleRecipeSelected(recipe: Recipe) {
    setPlanRecipe(recipe);
  }

  function closePlanFlow() {
    setPlanTarget(null);
    setPlanRecipe(null);
  }

  async function handleConfirmPortions(servings: number) {
    if (!planTarget || !planRecipe) return;
    try {
      await calendar.create({
        recipeId: planRecipe.id,
        plannedDate: planTarget.iso,
        mealSlot: planTarget.slot,
        servings,
      });
      closePlanFlow();
      loadEntries();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de planifier ce repas.",
      );
      closePlanFlow();
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

  async function handleValidateDifferent(recipe: Recipe) {
    if (!validateEntry) return;
    try {
      await calendar.validate(validateEntry.id, {
        done: true,
        actualRecipeId: recipe.id,
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

  function handleTabKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    if (e.key === "ArrowRight") {
      const next = weekDays[(currentIndex + 1) % weekDays.length];
      handleSelectDay(next.iso);
      document.getElementById(`tab-${next.iso}`)?.focus();
    } else if (e.key === "ArrowLeft") {
      const prev =
        weekDays[(currentIndex - 1 + weekDays.length) % weekDays.length];
      handleSelectDay(prev.iso);
      document.getElementById(`tab-${prev.iso}`)?.focus();
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
        <>
          {/* Mobile : bandeau de jours + vue du jour sélectionné */}
          <div className="sm:hidden">
            <div
              className="flex gap-1 overflow-x-auto pb-2 mb-3"
              role="tablist"
              aria-label="Jours de la semaine"
            >
              {weekDays.map((day, index) => {
                const isSelected = day.iso === resolvedSelectedDayIso;
                return (
                  <button
                    key={day.iso}
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls="mobile-day-panel"
                    id={`tab-${day.iso}`}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => handleSelectDay(day.iso)}
                    onKeyDown={(e) => handleTabKeyDown(e, index)}
                    className={`flex flex-col items-center rounded-lg px-3 py-2 min-w-[44px] min-h-[44px] justify-center flex-shrink-0 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface text-foreground-secondary"
                    }`}
                  >
                    <span className="uppercase">{day.label.slice(0, 3)}</span>
                    <span>{day.dayNumber}</span>
                    {day.isToday && !isSelected && (
                      <span
                        className="mt-0.5 h-1 w-1 rounded-full bg-accent"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div
              id="mobile-day-panel"
              role="tabpanel"
              aria-labelledby={`tab-${resolvedSelectedDayIso}`}
              className="flex flex-col gap-3"
            >
              {(() => {
                const day =
                  weekDays.find((d) => d.iso === resolvedSelectedDayIso) ??
                  weekDays[0];
                return (["MIDI", "SOIR"] as MealSlot[]).map((slot) => {
                  const entry = findEntry(day, slot);
                  return (
                    <div key={slot} className="flex flex-col gap-1">
                      <p className="text-[12px] uppercase tracking-wide text-foreground-secondary">
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
                });
              })()}
            </div>
          </div>

          {/* Tablette / desktop : grille 7 colonnes */}
          <div className="hidden sm:grid sm:grid-cols-7 gap-3">
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
                      <p className="text-[12px] uppercase tracking-wide text-foreground-secondary">
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
        </>
      )}

      <RecipePickerDialog
        open={planTarget !== null && planRecipe === null}
        title="Planifier une recette"
        onSelect={handleRecipeSelected}
        onClose={closePlanFlow}
      />

      <PortionsDialog
        open={planTarget !== null && planRecipe !== null}
        recipe={planRecipe}
        onConfirm={handleConfirmPortions}
        onClose={closePlanFlow}
      />

      <RecipePickerDialog
        open={validateEntry !== null}
        title="Recette réellement cuisinée"
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
