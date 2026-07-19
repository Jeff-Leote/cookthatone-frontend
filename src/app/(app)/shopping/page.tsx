"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError, shopping } from "@/lib/api";
import { addDays, formatWeekRange, getWeekStart, toIsoDate } from "@/lib/date";
import { UNIT_LABEL } from "@/lib/format";
import type { ShoppingList } from "@/lib/types";

export default function ShoppingPage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [list, setList] = useState<ShoppingList | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const weekStartIso = toIsoDate(weekStart);

  const fetchList = useCallback(async () => {
    const all = await shopping.list();
    const match = all.find((l) => l.weekStart.slice(0, 10) === weekStartIso);
    if (!match) return null;
    return shopping.get(match.id);
  }, [weekStartIso]);

  // Recharge à chaque changement de semaine. `cancelled` évite d'écraser
  // l'état avec la réponse d'une requête devenue obsolète (navigation
  // rapide entre semaines).
  useEffect(() => {
    let cancelled = false;
    fetchList()
      .then((data) => {
        if (cancelled) return;
        setList(data);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger la liste de courses.");
      });
    return () => {
      cancelled = true;
    };
  }, [fetchList]);

  const loadList = useCallback(async () => {
    setError(null);
    try {
      setList(await fetchList());
    } catch {
      setError("Impossible de charger la liste de courses.");
    }
  }, [fetchList]);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    try {
      await shopping.generate(weekStartIso);
      await loadList();
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

  async function handleToggle(itemId: string, checked: boolean) {
    if (!list) return;
    // Mise à jour optimiste : la case doit répondre immédiatement au clic.
    setList({
      ...list,
      items: list.items?.map((i) => (i.id === itemId ? { ...i, checked } : i)),
    });
    try {
      await shopping.toggleItem(list.id, itemId, checked);
    } catch {
      setError("Impossible de mettre à jour cet article.");
      loadList();
    }
  }

  async function handleValidate() {
    if (!list) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await shopping.validate(list.id);
      setList(updated);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de valider les courses.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!list) return;
    if (!window.confirm("Supprimer cette liste de courses ?")) return;
    try {
      await shopping.remove(list.id);
      setList(null);
    } catch {
      setError("Impossible de supprimer cette liste.");
    }
  }

  const checkedCount = list?.items?.filter((i) => i.checked).length ?? 0;
  const totalCount = list?.items?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-medium">Liste de courses</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            aria-label="Semaine précédente"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            ←
          </Button>
          <span className="text-sm text-foreground-secondary">
            {formatWeekRange(weekStart)}
          </span>
          <Button
            type="button"
            variant="secondary"
            aria-label="Semaine suivante"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            →
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

      {list === undefined && !error && (
        <p role="status" className="text-sm text-foreground-secondary">
          Chargement…
        </p>
      )}

      {list === null && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-6">
          <p className="text-sm text-foreground-secondary">
            Aucune liste générée pour la semaine du {formatWeekRange(weekStart)}
            .
          </p>
          <Button type="button" onClick={handleGenerate} disabled={busy}>
            {busy ? "Génération…" : "Générer la liste de cette semaine"}
          </Button>
        </div>
      )}

      {list && (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                Semaine du {formatWeekRange(weekStart)}
              </p>
              <p className="text-sm text-foreground-secondary">
                {checkedCount}/{totalCount} articles cochés
              </p>
            </div>
            {!list.validated && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={busy}
                >
                  Régénérer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  aria-label="Supprimer cette liste"
                >
                  <span aria-hidden="true">🗑️</span>
                </Button>
              </div>
            )}
          </div>

          {list.validated && (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <span aria-hidden="true">✓</span>
              Courses validées — le stock a été mis à jour.
            </p>
          )}

          {totalCount === 0 ? (
            <p className="text-sm text-foreground-secondary">
              Rien à acheter : le stock couvre déjà tous les besoins de la
              semaine.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {list.items?.map((item) => {
                const id = `shopping-item-${item.id}`;
                const missing = Math.max(
                  0,
                  item.quantityNeeded - item.quantityInStock,
                );
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-raised"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={item.checked}
                      disabled={list.validated}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                    <label
                      htmlFor={id}
                      className={`flex-1 text-sm ${
                        item.checked
                          ? "text-foreground-secondary line-through"
                          : "text-foreground"
                      }`}
                    >
                      {item.ingredient?.name ?? "Ingrédient"}
                    </label>
                    <span className="text-sm text-foreground-secondary">
                      {missing} {UNIT_LABEL[item.unit] ?? item.unit}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {!list.validated && totalCount > 0 && (
            <Button
              type="button"
              onClick={handleValidate}
              disabled={busy || checkedCount === 0}
              className="self-end"
            >
              <span aria-hidden="true">✓</span>{" "}
              {busy ? "Validation…" : `Valider (${checkedCount})`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
