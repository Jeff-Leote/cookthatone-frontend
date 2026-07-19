"use client";

import { useEffect, useRef } from "react";
import type { Recipe } from "@/lib/types";

interface RecipePickerDialogProps {
  open: boolean;
  title: string;
  recipes: Recipe[];
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

/**
 * Utilise <dialog> natif plutôt qu'une modale maison : piégeage du focus,
 * fermeture au clavier (Échap) et état "inert" du reste de la page sont
 * gérés nativement par le navigateur (RGAA 12.8 / 12.11).
 */
export function RecipePickerDialog({
  open,
  title,
  recipes,
  onSelect,
  onClose,
}: RecipePickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-md p-1 text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {recipes.length === 0 ? (
          <p className="px-3 py-4 text-sm text-foreground-secondary">
            Aucune recette disponible.
          </p>
        ) : (
          <ul>
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <button
                  type="button"
                  onClick={() => onSelect(recipe.id)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface-raised"
                >
                  {recipe.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
