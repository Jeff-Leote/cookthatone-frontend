"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AddStockDialog } from "@/components/stock/AddStockDialog";
import {
  ApiError,
  ingredients as ingredientsApi,
  stock as stockApi,
} from "@/lib/api";
import { getExpiryStatus, UNIT_LABEL } from "@/lib/format";
import type { Ingredient, StockItem, Unit } from "@/lib/types";

const TONE_CLASSES = {
  danger: "bg-danger/15 text-danger",
  warning: "bg-accent/15 text-accent",
  neutral: "text-foreground-secondary",
};

export default function StockPage() {
  const [items, setItems] = useState<StockItem[] | null>(null);
  const [catalogue, setCatalogue] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  function loadStock() {
    stockApi
      .list()
      .then((data) => {
        setItems(data);
        setError(null);
      })
      .catch(() => setError("Impossible de charger le stock."));
  }

  useEffect(() => {
    loadStock();
    ingredientsApi
      .list()
      .then(setCatalogue)
      .catch(() => setCatalogue([]));
  }, []);

  async function handleAdd(data: {
    ingredientId: string;
    quantity: number;
    unit: Unit;
    expiresAt?: string;
  }) {
    try {
      await stockApi.create(data);
      setAddOpen(false);
      loadStock();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible d'ajouter cet article.",
      );
      setAddOpen(false);
    }
  }

  async function handleQuantityChange(item: StockItem, quantity: number) {
    if (!(quantity > 0)) return;
    try {
      await stockApi.update(item.id, { quantity });
      loadStock();
    } catch {
      setError("Impossible de mettre à jour la quantité.");
    }
  }

  async function handleRemove(item: StockItem) {
    if (
      !window.confirm(
        `Retirer « ${item.ingredient?.name ?? "cet article"} » du stock ?`,
      )
    ) {
      return;
    }
    try {
      await stockApi.remove(item.id);
      loadStock();
    } catch {
      setError("Impossible de retirer cet article.");
    }
  }

  const expiringCount =
    items?.filter((i) => {
      const status = getExpiryStatus(i.expiresAt);
      return status.tone === "danger" || status.tone === "warning";
    }).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-medium">Stock</h1>
        <div className="flex items-center gap-2">
          {expiringCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground-secondary">
              <span aria-hidden="true">⚠️</span>
              Bientôt périmés {expiringCount}
            </span>
          )}
          <Button type="button" onClick={() => setAddOpen(true)}>
            <span aria-hidden="true">+</span> Ajouter
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {items === null && !error && (
        <p role="status" className="text-sm text-foreground-secondary">
          Chargement…
        </p>
      )}

      {items !== null && items.length === 0 && (
        <p className="text-sm text-foreground-secondary">
          Rien en stock pour l&apos;instant.
        </p>
      )}

      {items !== null && items.length > 0 && (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <caption className="sr-only">Articles en stock</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-secondary">
                <th scope="col" className="py-2 font-medium">
                  Ingrédient
                </th>
                <th scope="col" className="py-2 font-medium">
                  Quantité
                </th>
                <th scope="col" className="py-2 font-medium">
                  Péremption
                </th>
                <th scope="col" className="py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = getExpiryStatus(item.expiresAt);
                const name = item.ingredient?.name ?? "Ingrédient";
                return (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-2.5 font-medium">{name}</td>
                    <td className="py-2.5">
                      <label className="sr-only" htmlFor={`qty-${item.id}`}>
                        Quantité de {name}
                      </label>
                      <div className="flex items-center gap-1 text-foreground-secondary">
                        <input
                          id={`qty-${item.id}`}
                          type="number"
                          min={0}
                          step="any"
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            if (value !== item.quantity) {
                              handleQuantityChange(item, value);
                            }
                          }}
                          className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus-visible:border-accent"
                        />
                        <span>{UNIT_LABEL[item.unit] ?? item.unit}</span>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${TONE_CLASSES[status.tone]}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemove(item)}
                        aria-label={`Retirer ${name} du stock`}
                      >
                        <span aria-hidden="true">🗑️</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddStockDialog
        open={addOpen}
        ingredients={catalogue}
        onSubmit={handleAdd}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}
