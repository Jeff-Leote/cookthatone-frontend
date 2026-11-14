"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GenerateShoppingListDialog } from "@/components/shopping/GenerateShoppingListDialog";
import { useSlowRequest } from "@/lib/useSlowRequest";
import { ApiError, shopping } from "@/lib/api";
import {
  addMonths,
  formatMonthLabel,
  formatWeekTitle,
  getMonthStart,
  getWeekStart,
  monthOverlapsRange,
  parseIsoDate,
  toIsoDate,
} from "@/lib/date";
import { formatShoppingListTitle, UNIT_LABEL } from "@/lib/format";
import type { ShoppingList } from "@/lib/types";

interface WeekGroup {
  key: string;
  weekStart: Date;
  lists: ShoppingList[];
}

// Une liste est rangée dans la semaine de sa date de début ; sa plage complète
// reste affichée dans son titre si elle déborde sur la semaine suivante.
function groupByWeek(lists: ShoppingList[]): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();
  for (const list of lists) {
    const weekStart = getWeekStart(parseIsoDate(list.periodStart));
    const key = toIsoDate(weekStart);
    const group = groups.get(key) ?? { key, weekStart, lists: [] };
    group.lists.push(list);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export default function ShoppingPage() {
  const [monthDate, setMonthDate] = useState(() => getMonthStart(new Date()));
  const [lists, setLists] = useState<ShoppingList[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busyListId, setBusyListId] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [confirmUnvalidateList, setConfirmUnvalidateList] =
    useState<ShoppingList | null>(null);
  const [confirmDeleteList, setConfirmDeleteList] =
    useState<ShoppingList | null>(null);
  const isRegenerateSlow = useSlowRequest(busyListId !== null);

  const loadLists = useCallback(async () => {
    const all = await shopping.list();
    const overlapping = all.filter((l) =>
      monthOverlapsRange(monthDate, l.periodStart, l.periodEnd),
    );
    const detailed = await Promise.all(
      overlapping.map((l) => shopping.get(l.id)),
    );
    return detailed.sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  }, [monthDate]);

  // Recharge à chaque changement de mois. `cancelled` évite d'écraser
  // l'état avec la réponse d'une requête devenue obsolète (navigation
  // rapide entre mois). L'état "Chargement…" est déclenché par les
  // gestionnaires qui changent `monthDate` (pas ici : cf. no-set-state-in-effect).
  useEffect(() => {
    let cancelled = false;
    loadLists()
      .then((data) => {
        if (cancelled) return;
        setLists(data);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger les listes de courses.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadLists]);

  function goToMonth(next: Date) {
    setLists(undefined);
    setMonthDate(next);
  }

  async function refresh() {
    try {
      setLists(await loadLists());
    } catch {
      setError("Impossible de charger les listes de courses.");
    }
  }

  function handleGenerated(generated: ShoppingList[]) {
    // La plage choisie peut tomber hors du mois actuellement affiché ;
    // on bascule sur le mois de la première liste pour qu'elle soit visible.
    goToMonth(getMonthStart(new Date(generated[0].periodStart)));
  }

  async function handleRegenerate(list: ShoppingList) {
    setBusyListId(list.id);
    setError(null);
    try {
      await shopping.generate(
        list.periodStart.slice(0, 10),
        list.periodEnd.slice(0, 10),
      );
      // Une ancienne liste de plusieurs semaines est remplacée par une liste
      // par semaine : on recharge pour afficher le résultat.
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de régénérer la liste.",
      );
    } finally {
      setBusyListId(null);
    }
  }

  async function handleToggle(
    list: ShoppingList,
    itemId: string,
    checked: boolean,
  ) {
    // Mise à jour optimiste : la case doit répondre immédiatement au clic.
    setLists((prev) =>
      prev?.map((l) =>
        l.id === list.id
          ? {
              ...l,
              items: l.items?.map((i) =>
                i.id === itemId ? { ...i, checked } : i,
              ),
            }
          : l,
      ),
    );
    try {
      await shopping.toggleItem(list.id, itemId, checked);
    } catch {
      setError("Impossible de mettre à jour cet article.");
      refresh();
    }
  }

  async function handleToggleAll(list: ShoppingList, checked: boolean) {
    if (!list.items) return;
    const targets = list.items.filter((i) => i.checked !== checked);
    if (targets.length === 0) return;
    setLists((prev) =>
      prev?.map((l) =>
        l.id === list.id
          ? { ...l, items: l.items?.map((i) => ({ ...i, checked })) }
          : l,
      ),
    );
    try {
      await Promise.all(
        targets.map((i) => shopping.toggleItem(list.id, i.id, checked)),
      );
    } catch {
      setError("Impossible de mettre à jour tous les articles.");
      refresh();
    }
  }

  async function handleValidate(list: ShoppingList) {
    setBusyListId(list.id);
    setError(null);
    try {
      const updated = await shopping.validate(list.id);
      setLists((prev) => prev?.map((l) => (l.id === list.id ? updated : l)));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de valider les courses.",
      );
    } finally {
      setBusyListId(null);
    }
  }

  function handleUnvalidate(list: ShoppingList) {
    setConfirmUnvalidateList(list);
  }

  async function handleConfirmUnvalidate() {
    if (!confirmUnvalidateList) return;
    const list = confirmUnvalidateList;
    setConfirmUnvalidateList(null);
    setBusyListId(list.id);
    setError(null);
    try {
      const updated = await shopping.unvalidate(list.id);
      setLists((prev) => prev?.map((l) => (l.id === list.id ? updated : l)));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de dévalider les courses.",
      );
    } finally {
      setBusyListId(null);
    }
  }

  function handleDelete(list: ShoppingList) {
    setConfirmDeleteList(list);
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteList) return;
    const list = confirmDeleteList;
    setConfirmDeleteList(null);
    try {
      await shopping.remove(list.id);
      setLists((prev) => prev?.filter((l) => l.id !== list.id));
    } catch {
      setError("Impossible de supprimer cette liste.");
    }
  }

  const weekGroups = groupByWeek(lists ?? []);
  const currentWeekKey = toIsoDate(getWeekStart(new Date()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-medium">Liste de courses</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            aria-label="Mois précédent"
            onClick={() => goToMonth(addMonths(monthDate, -1))}
          >
            ←
          </Button>
          <span className="min-w-32 text-center text-sm text-foreground-secondary">
            {formatMonthLabel(monthDate)}
          </span>
          <Button
            type="button"
            variant="secondary"
            aria-label="Mois suivant"
            onClick={() => goToMonth(addMonths(monthDate, 1))}
          >
            →
          </Button>
          <Button type="button" onClick={() => setGenerateOpen(true)}>
            <Plus size={16} aria-hidden="true" /> Générer une liste de courses
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

      {lists === undefined && !error && (
        <output className="text-sm text-foreground-secondary">
          Chargement…
        </output>
      )}

      {isRegenerateSlow && (
        <p role="status" className="text-xs text-foreground-secondary">
          Le serveur se réveille, encore quelques secondes…
        </p>
      )}

      {lists?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
          <ShoppingCart
            className="size-10 text-foreground-secondary"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium">
              Aucune liste pour {formatMonthLabel(monthDate)}
            </p>
            <p className="mt-1 text-sm text-foreground-secondary">
              Génère une liste à partir de ton calendrier de repas.
            </p>
          </div>
          <Button type="button" onClick={() => setGenerateOpen(true)}>
            <Plus size={16} aria-hidden="true" /> Générer une liste de courses
          </Button>
        </div>
      )}

      {weekGroups.map((group) => (
        <section
          key={group.key}
          aria-labelledby={`week-${group.key}`}
          className="flex flex-col gap-4"
        >
          <h2
            id={`week-${group.key}`}
            className="flex flex-wrap items-center gap-2 font-heading text-lg font-medium"
          >
            {formatWeekTitle(group.weekStart)}
            {group.key === currentWeekKey && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                Cette semaine
              </span>
            )}
          </h2>
          {group.lists.map((list) => {
            const busy = busyListId === list.id;
            const checkedCount =
              list.items?.filter((i) => i.checked).length ?? 0;
            const totalCount = list.items?.length ?? 0;

            return (
              <div
                key={list.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {formatShoppingListTitle(
                        list.periodStart,
                        list.periodEnd,
                      )}
                    </p>
                    <p className="text-sm text-foreground-secondary">
                      {checkedCount}/{totalCount} articles cochés
                    </p>
                    {!list.validated && totalCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleAll(list, checkedCount < totalCount)
                        }
                        className="text-sm text-accent underline-offset-2 hover:underline"
                      >
                        {checkedCount < totalCount
                          ? "Tout cocher"
                          : "Tout décocher"}
                      </button>
                    )}
                  </div>
                  {!list.validated && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleRegenerate(list)}
                        disabled={busy}
                      >
                        {busy ? "Régénération…" : "Régénérer"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDelete(list)}
                        aria-label="Supprimer cette liste"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>

                {list.validated && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-sm text-success">
                      <Check size={16} aria-hidden="true" /> Courses validées —
                      le stock a été mis à jour.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleUnvalidate(list)}
                      disabled={busy}
                    >
                      {busy ? "Dévalidation…" : "Dévalider"}
                    </Button>
                  </div>
                )}

                {totalCount === 0 ? (
                  <p className="text-sm text-foreground-secondary">
                    Rien à acheter : le stock couvre déjà tous les besoins de
                    cette période.
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
                          <label
                            htmlFor={id}
                            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center"
                          >
                            <span className="sr-only">
                              {item.ingredient?.name ?? "Ingrédient"}
                            </span>
                            <input
                              id={id}
                              type="checkbox"
                              checked={item.checked}
                              disabled={list.validated}
                              onChange={(e) =>
                                handleToggle(list, item.id, e.target.checked)
                              }
                              className="h-4 w-4 accent-accent"
                            />
                          </label>
                          <span
                            className={`flex-1 text-sm ${
                              item.checked
                                ? "text-foreground-secondary line-through"
                                : "text-foreground"
                            }`}
                          >
                            {item.ingredient?.name ?? "Ingrédient"}
                          </span>
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
                    onClick={() => handleValidate(list)}
                    disabled={busy || checkedCount === 0}
                    className="self-end"
                  >
                    <Check size={16} aria-hidden="true" />{" "}
                    {busy ? "Validation…" : `Valider (${checkedCount})`}
                  </Button>
                )}
              </div>
            );
          })}
        </section>
      ))}

      <GenerateShoppingListDialog
        open={generateOpen}
        defaultDate={monthDate}
        onGenerated={handleGenerated}
        onClose={() => setGenerateOpen(false)}
      />

      <ConfirmDialog
        open={confirmUnvalidateList !== null}
        title="Dévalider cette liste ?"
        description="Le stock ajouté lors de la validation sera retiré."
        confirmLabel="Dévalider"
        onConfirm={handleConfirmUnvalidate}
        onClose={() => setConfirmUnvalidateList(null)}
      />

      <ConfirmDialog
        open={confirmDeleteList !== null}
        title="Supprimer cette liste de courses ?"
        confirmLabel="Supprimer"
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDeleteList(null)}
      />
    </div>
  );
}
