"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ApiError, shopping } from "@/lib/api";
import { toIsoDate } from "@/lib/date";
import type { ShoppingList } from "@/lib/types";

interface GenerateShoppingListDialogProps {
  open: boolean;
  defaultDate: Date;
  onGenerated: (list: ShoppingList) => void;
  onClose: () => void;
}

/**
 * Génère une liste de courses pour une plage de jours libre. Le backend
 * vérifie que chaque jour de la plage a une recette planifiée et qu'elle ne
 * chevauche aucune liste existante — l'erreur reste affichée dans le
 * dialogue plutôt que de le fermer, pour que l'utilisateur puisse corriger
 * les dates sans perdre le contexte.
 */
export function GenerateShoppingListDialog({
  open,
  defaultDate,
  onGenerated,
  onClose,
}: GenerateShoppingListDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError(null);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const periodStart = String(data.get("periodStart") || "");
    const periodEnd = String(data.get("periodEnd") || "");
    if (!periodStart || !periodEnd) return;

    setBusy(true);
    setError(null);
    try {
      const list = await shopping.generate(periodStart, periodEnd);
      onGenerated(list);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de générer la liste.",
      );
    } finally {
      setBusy(false);
    }
  }

  const defaultIso = toIsoDate(defaultDate);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">
          Générer une liste de courses
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
        <p className="text-sm text-foreground-secondary">
          Choisis une plage de jours : chaque jour doit avoir au moins un
          repas planifié au calendrier.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Du"
            name="periodStart"
            type="date"
            defaultValue={defaultIso}
            required
          />
          <Field
            label="Au"
            name="periodEnd"
            type="date"
            defaultValue={defaultIso}
            required
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        )}
        <Button type="submit" className="mt-1" disabled={busy}>
          {busy ? "Génération…" : "Générer"}
        </Button>
      </form>
    </dialog>
  );
}
