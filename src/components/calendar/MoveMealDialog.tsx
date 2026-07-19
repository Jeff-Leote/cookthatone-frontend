"use client";

import { useEffect, useRef } from "react";
import type { WeekDay } from "@/lib/date";
import { MEAL_SLOT_LABEL } from "@/lib/format";
import type { MealSlot } from "@/lib/types";

interface MoveMealDialogProps {
  open: boolean;
  weekDays: WeekDay[];
  onSelect: (iso: string, slot: MealSlot) => void;
  onClose: () => void;
}

const SLOTS: MealSlot[] = ["MIDI", "SOIR"];

export function MoveMealDialog({
  open,
  weekDays,
  onSelect,
  onClose,
}: MoveMealDialogProps) {
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
      className="w-full max-w-md rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">Déplacer vers…</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-md p-1 text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-4 sm:grid-cols-4">
        {weekDays.map((day) =>
          SLOTS.map((slot) => (
            <button
              key={`${day.iso}-${slot}`}
              type="button"
              onClick={() => onSelect(day.iso, slot)}
              aria-label={`${day.label} ${day.dayNumber} — ${MEAL_SLOT_LABEL[slot]}`}
              className="rounded-lg border border-border px-2 py-2 text-xs hover:border-border-strong hover:bg-surface-raised"
            >
              <span aria-hidden="true" className="block font-medium">
                {day.label} {day.dayNumber}
              </span>
              <span aria-hidden="true" className="text-foreground-secondary">
                {MEAL_SLOT_LABEL[slot]}
              </span>
            </button>
          )),
        )}
      </div>
    </dialog>
  );
}
