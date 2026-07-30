"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { Recipe } from "@/lib/types";

interface PortionsDialogProps {
  open: boolean;
  recipe: Recipe | null;
  onConfirm: (servings: number) => void;
  onClose: () => void;
}

/**
 * Demande de confirmer le nombre de portions pour ce repas precis, pre-rempli
 * avec les portions de base de la recette. Les quantites d'ingredients
 * (liste de courses, consommation de stock) sont mises a l'echelle en
 * consequence.
 */
export function PortionsDialog({
  open,
  recipe,
  onConfirm,
  onClose,
}: PortionsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const servings = Number(data.get("servings"));
    if (!(servings > 0)) return;
    onConfirm(servings);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">
          Nombre de portions
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-md p-1 text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {recipe && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <p className="text-sm text-foreground-secondary">
            {recipe.title} est prévue pour {recipe.servings} portion
            {recipe.servings > 1 ? "s" : ""}. Combien de portions pour ce repas
            ?
          </p>
          <Field
            label="Portions"
            name="servings"
            type="number"
            min={1}
            step={1}
            defaultValue={recipe.servings}
            required
          />
          <Button type="submit" className="mt-1">
            Confirmer
          </Button>
        </form>
      )}
    </dialog>
  );
}
