import { Check, Plus, X } from "lucide-react";
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
          className="flex-1 flex-col gap-1 justify-center text-xs text-foreground-secondary"
          aria-label={`Planifier un repas — ${context}`}
        >
          <Plus size={16} aria-hidden="true" />
          Planifier
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
          ? "border-success/30 bg-success/8"
          : "border-border bg-surface"
      }`}
    >
      <p className={`font-medium ${entry.done ? "text-foreground" : ""}`}>
        {title}
      </p>
      <p className="text-foreground-secondary">
        {entry.servings} portion{entry.servings > 1 ? "s" : ""}
      </p>
      {entry.done && (
        <p className="flex items-center gap-1 font-medium text-success">
          <Check size={12} aria-hidden="true" />
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
              className="px-2 min-h-[44px] text-xs"
              aria-label={`Valider — ${context}, ${title}`}
            >
              Valider
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onValidateDifferent}
              className="px-2 min-h-[44px] text-xs"
              aria-label={`Valider avec une autre recette — ${context}, ${title}`}
            >
              Autre recette
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onMove}
              className="px-2 min-h-[44px] text-xs"
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
          className="px-2 min-h-[44px] text-xs"
          aria-label={`Retirer du calendrier — ${context}, ${title}`}
        >
          <X size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
