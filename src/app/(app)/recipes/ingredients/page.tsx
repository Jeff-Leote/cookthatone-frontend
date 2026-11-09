"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError, ingredients as ingredientsApi } from "@/lib/api";
import { UNIT_LABEL } from "@/lib/format";
import type { Ingredient, Unit } from "@/lib/types";
import { EQUIVALENCE_EXAMPLES } from "@/lib/units";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

const EQUIVALENCE_ERROR =
  "Le poids d'une cuillère à soupe doit être un nombre positif, 100 g au maximum.";

// null : champ vide (rien à enregistrer) ; "invalid" : valeur refusée par l'API.
function parseEquivalence(raw: string): number | null | "invalid" {
  if (raw.trim() === "") return null;
  const value = Number(raw.replace(",", "."));
  return Number.isFinite(value) && value > 0 && value <= 100
    ? value
    : "invalid";
}

export default function IngredientsPage() {
  const [items, setItems] = useState<Ingredient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("G");
  const [equivalence, setEquivalence] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    ingredientsApi
      .list()
      .then(setItems)
      .catch(() => setError("Impossible de charger le catalogue."));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    const grams = parseEquivalence(equivalence);
    if (grams === "invalid") {
      setError(EQUIVALENCE_ERROR);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await ingredientsApi.create({
        name: name.trim(),
        defaultUnit: unit,
        ...(grams !== null && { gramsPerTablespoon: grams }),
      });
      setItems((current) => [...(current ?? []), created]);
      setName("");
      setEquivalence("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Le choix est contrôlé par l'état : si l'API refuse (changement de famille
  // d'un ingrédient utilisé), la liste garde l'ancienne unité.
  async function handleUnitChange(ingredient: Ingredient, defaultUnit: Unit) {
    if (defaultUnit === ingredient.defaultUnit) return;
    setUpdatingId(ingredient.id);
    setError(null);
    try {
      const updated = await ingredientsApi.update(ingredient.id, {
        defaultUnit,
      });
      setItems(
        (current) =>
          current?.map((i) => (i.id === ingredient.id ? updated : i)) ?? null,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de modifier l'unité.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Enregistré à la sortie du champ. Une valeur vide ou identique ne change rien.
  async function handleEquivalenceCommit(ingredient: Ingredient) {
    const draft = drafts[ingredient.id];
    setDrafts((current) => {
      const rest = { ...current };
      delete rest[ingredient.id];
      return rest;
    });
    if (draft === undefined) return;
    const grams = parseEquivalence(draft);
    if (grams === null || grams === ingredient.gramsPerTablespoon) return;
    if (grams === "invalid") {
      setError(EQUIVALENCE_ERROR);
      return;
    }
    setUpdatingId(ingredient.id);
    setError(null);
    try {
      const updated = await ingredientsApi.update(ingredient.id, {
        gramsPerTablespoon: grams,
      });
      setItems(
        (current) =>
          current?.map((i) => (i.id === ingredient.id ? updated : i)) ?? null,
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Impossible de modifier l'équivalence.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(ingredient: Ingredient) {
    if (!window.confirm(`Retirer « ${ingredient.name} » du catalogue ?`)) {
      return;
    }
    setRemovingId(ingredient.id);
    try {
      await ingredientsApi.remove(ingredient.id);
      setItems(
        (current) => current?.filter((i) => i.id !== ingredient.id) ?? null,
      );
    } catch {
      setError("Impossible de supprimer cet ingrédient.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/recipes"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Recettes
        </Link>
        <h1 className="font-heading text-2xl font-medium">
          Catalogue d&apos;ingrédients
        </h1>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-2"
        aria-label="Ajouter un ingrédient"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="ingredient-name" className="sr-only">
            Nom de l&apos;ingrédient
          </label>
          <input
            id="ingredient-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'ingrédient"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/60 focus-visible:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ingredient-unit" className="sr-only">
            Unité par défaut
          </label>
          <select
            id="ingredient-unit"
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
        <div className="flex w-32 flex-col gap-1.5">
          <label htmlFor="ingredient-equivalence" className="sr-only">
            Poids d&apos;une c. à soupe en grammes (facultatif)
          </label>
          <input
            id="ingredient-equivalence"
            type="number"
            min={0}
            max={100}
            step="any"
            inputMode="decimal"
            value={equivalence}
            onChange={(e) => setEquivalence(e.target.value)}
            placeholder="g / c. à soupe"
            className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/60 focus-visible:border-accent"
          />
        </div>
        <Button type="submit" disabled={submitting || !name.trim()}>
          <span aria-hidden="true">+</span> Ajouter
        </Button>
      </form>

      <p className="text-xs text-foreground-secondary">
        Changer l&apos;unité convertit le stock. Le poids d&apos;une cuillère à
        soupe (colonne « g / c. à soupe ») permet de passer des grammes aux
        cuillères et aux ml ; sans lui, une cuillère compte 15 g. Exemples :{" "}
        {EQUIVALENCE_EXAMPLES}.
      </p>

      {items === null && !error && (
        <p role="status" className="text-sm text-foreground-secondary">
          Chargement…
        </p>
      )}

      {items !== null && items.length === 0 && (
        <p className="text-sm text-foreground-secondary">
          Aucun ingrédient pour l&apos;instant.
        </p>
      )}

      {items !== null && items.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Catalogue d&apos;ingrédients</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-secondary">
              <th scope="col" className="py-2 font-medium">
                Ingrédient
              </th>
              <th scope="col" className="py-2 font-medium">
                Unité par défaut
              </th>
              <th scope="col" className="py-2 font-medium">
                g / c. à soupe
              </th>
              <th scope="col" className="py-2 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((ingredient) => (
              <tr key={ingredient.id} className="border-b border-border">
                <td className="py-2.5 font-medium">{ingredient.name}</td>
                <td className="py-2.5">
                  <label htmlFor={`unit-${ingredient.id}`} className="sr-only">
                    Unité de {ingredient.name}
                  </label>
                  <select
                    id={`unit-${ingredient.id}`}
                    value={ingredient.defaultUnit}
                    disabled={updatingId === ingredient.id}
                    onChange={(e) =>
                      handleUnitChange(ingredient, e.target.value as Unit)
                    }
                    className="min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-accent disabled:opacity-50"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {UNIT_LABEL[u]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2.5">
                  <label
                    htmlFor={`equivalence-${ingredient.id}`}
                    className="sr-only"
                  >
                    Poids d&apos;une c. à soupe de {ingredient.name}, en grammes
                  </label>
                  <input
                    id={`equivalence-${ingredient.id}`}
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    inputMode="decimal"
                    placeholder="—"
                    value={
                      drafts[ingredient.id] ??
                      String(ingredient.gramsPerTablespoon ?? "")
                    }
                    disabled={updatingId === ingredient.id}
                    onChange={(e) =>
                      setDrafts((current) => ({
                        ...current,
                        [ingredient.id]: e.target.value,
                      }))
                    }
                    onBlur={() => handleEquivalenceCommit(ingredient)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="min-h-11 w-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-secondary/60 focus-visible:border-accent disabled:opacity-50"
                  />
                </td>
                <td className="py-2.5 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemove(ingredient)}
                    disabled={removingId === ingredient.id}
                    aria-label={`Retirer ${ingredient.name} du catalogue`}
                  >
                    <span aria-hidden="true">🗑️</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
