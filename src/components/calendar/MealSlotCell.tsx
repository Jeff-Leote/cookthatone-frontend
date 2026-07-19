import { Button } from "@/components/ui/Button";
import type { CalendarEntry } from "@/lib/types";

interface MealSlotCellProps {
  entry: CalendarEntry | undefined;
  dayLabel: string;
  slotLabel: string;
  onPlan: () => void;
  onValidate: () => void;
  onValidateDifferent: () => void;
  onMove: () => void;
  onRemove: () => void;
}

export function MealSlotCell({
  entry,
  dayLabel,
  slotLabel,
  onPlan,
  onValidate,
  onValidateDifferent,
  onMove,
  onRemove,
}: MealSlotCellProps) {
  const context = `${slotLabel} du ${dayLabel}`;

  if (!entry) {
    return (
      <div className="flex min-h-24 flex-col rounded-lg border border-dashed border-border p-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onPlan}
          className="flex-1 justify-center text-xs"
          aria-label={`Planifier un repas — ${context}`}
        >
          <span aria-hidden="true">+</span> Planifier
        </Button>
      </div>
    );
  }

  const title = entry.recipe?.title ?? "Recette";
  const actualTitle = entry.actualRecipe?.title;

  return (
    <div
      className={`flex min-h-24 flex-col gap-1.5 rounded-lg border p-2.5 text-xs ${
        entry.done
          ? "border-success/40 bg-success/5"
          : "border-border bg-surface"
      }`}
    >
      <p className="font-medium">{title}</p>
      {entry.done && (
        <p className="flex items-center gap-1 text-success">
          <span aria-hidden="true">✓</span>
          {actualTitle && actualTitle !== title
            ? `Réalisé : ${actualTitle}`
            : "Validé"}
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-1">
        {!entry.done && (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={onValidate}
              className="px-2 py-1 text-xs"
              aria-label={`Valider — ${context}, ${title}`}
            >
              Valider
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onValidateDifferent}
              className="px-2 py-1 text-xs"
              aria-label={`Valider avec une autre recette — ${context}, ${title}`}
            >
              Autre recette
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onMove}
              className="px-2 py-1 text-xs"
              aria-label={`Déplacer — ${context}, ${title}`}
            >
              Déplacer
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          className="px-2 py-1 text-xs"
          aria-label={`Retirer du calendrier — ${context}, ${title}`}
        >
          <span aria-hidden="true">✕</span>
        </Button>
      </div>
    </div>
  );
}
