"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { UNIT_LABEL } from "@/lib/format";
import type { Unit } from "@/lib/types";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

interface AddIngredientDialogProps {
  open: boolean;
  onSubmit: (data: { name: string; defaultUnit: Unit }) => void;
  onClose: () => void;
}

/**
 * Permet de créer un ingrédient sans quitter le formulaire de recette
 * (auparavant il fallait aller sur /recipes/ingredients, perdant la saisie
 * de la recette en cours).
 */
export function AddIngredientDialog({
  open,
  onSubmit,
  onClose,
}: AddIngredientDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [unit, setUnit] = useState<Unit>("G");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setUnit("G");
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    onSubmit({ name, defaultUnit: unit });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">
          Nouvel ingrédient
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        <Field
          label="Nom"
          name="name"
          autoFocus
          autoComplete="off"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="new-ingredient-unit"
            className="text-xs font-medium uppercase tracking-wide text-foreground-secondary"
          >
            Unité par défaut
          </label>
          <select
            id="new-ingredient-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus-visible:border-accent"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {UNIT_LABEL[u]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="mt-1">
          Ajouter à la recette
        </Button>
      </form>
    </dialog>
  );
}
