"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { UNIT_LABEL } from "@/lib/format";
import type { Ingredient, Unit } from "@/lib/types";

interface AddStockDialogProps {
  open: boolean;
  ingredients: Ingredient[];
  onSubmit: (data: {
    ingredientId: string;
    quantity: number;
    unit: Unit;
    expiresAt?: string;
  }) => void;
  onClose: () => void;
}

export function AddStockDialog({
  open,
  ingredients,
  onSubmit,
  onClose,
}: AddStockDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id ?? "");
  // L'unité est celle de l'ingrédient, fixée à sa création : le stock, les
  // recettes et la liste de courses restent comparables.
  const unit: Unit =
    ingredients.find((i) => i.id === ingredientId)?.defaultUnit ?? "G";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setIngredientId(ingredients[0]?.id ?? "");
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, ingredients]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const quantity = Number(data.get("quantity"));
    const expiresAt = String(data.get("expiresAt") || "");
    if (!ingredientId || !(quantity > 0)) return;
    onSubmit({
      ingredientId,
      quantity,
      unit,
      expiresAt: expiresAt || undefined,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">Ajouter au stock</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-md p-1 text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {ingredients.length === 0 ? (
        <p className="px-5 py-6 text-sm text-foreground-secondary">
          Ton catalogue d&apos;ingrédients est vide — ajoute d&apos;abord un
          ingrédient depuis Recettes &gt; Ingrédients.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="stock-ingredient"
              className="text-xs font-medium uppercase tracking-wide text-foreground-secondary"
            >
              Ingrédient
            </label>
            <select
              id="stock-ingredient"
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus-visible:border-accent"
            >
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Quantité"
              name="quantity"
              type="number"
              min={0}
              step="any"
              defaultValue={1}
              required
            />
            <div className="flex flex-col gap-1.5">
              <span
                id="stock-unit-label"
                className="text-xs font-medium uppercase tracking-wide text-foreground-secondary"
              >
                Unité
              </span>
              <p
                aria-labelledby="stock-unit-label"
                aria-describedby="stock-unit-hint"
                className="flex min-h-11 items-center rounded-lg border border-border bg-surface-raised px-3.5 text-sm text-foreground"
              >
                {UNIT_LABEL[unit] ?? unit}
              </p>
              <p
                id="stock-unit-hint"
                className="text-xs text-foreground-secondary"
              >
                Fixée par l&apos;ingrédient
              </p>
            </div>
          </div>
          <Field
            label="Date de péremption"
            name="expiresAt"
            type="date"
            hint="Facultatif"
          />
          <Button type="submit" className="mt-1">
            Ajouter
          </Button>
        </form>
      )}
    </dialog>
  );
}
