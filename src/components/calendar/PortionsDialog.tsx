"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { Recipe } from "@/lib/types";
import { useSlowRequest } from "@/lib/useSlowRequest";

interface PortionsDialogProps {
  open: boolean;
  recipe: Recipe | null;
  onConfirm: (servings: number) => Promise<void>;
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
  const [submitting, setSubmitting] = useState(false);
  const isSlow = useSlowRequest(submitting);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const servings = Number(data.get("servings"));
    if (!(servings > 0)) return;
    setSubmitting(true);
    try {
      await onConfirm(servings);
    } finally {
      setSubmitting(false);
    }
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
          <X size={18} aria-hidden="true" />
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
          {isSlow && (
            <p role="status" className="text-xs text-foreground-secondary">
              Le serveur se réveille, encore quelques secondes…
            </p>
          )}
          <Button type="submit" className="mt-1" disabled={submitting}>
            {submitting ? "Confirmation…" : "Confirmer"}
          </Button>
        </form>
      )}
    </dialog>
  );
}
