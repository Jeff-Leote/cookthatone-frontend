"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { UNIT_LABEL } from "@/lib/format";
import type { Ingredient, Unit } from "@/lib/types";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

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
  const [unit, setUnit] = useState<Unit>(ingredients[0]?.defaultUnit ?? "G");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setIngredientId(ingredients[0]?.id ?? "");
      setUnit(ingredients[0]?.defaultUnit ?? "G");
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open, ingredients]);

  function handleIngredientChange(id: string) {
    setIngredientId(id);
    const ingredient = ingredients.find((i) => i.id === id);
    if (ingredient) setUnit(ingredient.defaultUnit);
  }

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
              onChange={(e) => handleIngredientChange(e.target.value)}
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
              <label
                htmlFor="stock-unit"
                className="text-xs font-medium uppercase tracking-wide text-foreground-secondary"
              >
                Unité
              </label>
              <select
                id="stock-unit"
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
