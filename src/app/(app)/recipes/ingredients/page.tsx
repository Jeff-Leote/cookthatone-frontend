"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError, ingredients as ingredientsApi } from "@/lib/api";
import { UNIT_LABEL } from "@/lib/format";
import type { Ingredient, Unit } from "@/lib/types";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

export default function IngredientsPage() {
  const [items, setItems] = useState<Ingredient[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("G");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    ingredientsApi
      .list()
      .then(setItems)
      .catch(() => setError("Impossible de charger le catalogue."));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await ingredientsApi.create({
        name: name.trim(),
        defaultUnit: unit,
      });
      setItems((current) => [...(current ?? []), created]);
      setName("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
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
        <Button type="submit" disabled={submitting || !name.trim()}>
          <span aria-hidden="true">+</span> Ajouter
        </Button>
      </form>

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
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((ingredient) => (
              <tr key={ingredient.id} className="border-b border-border">
                <td className="py-2.5 font-medium">{ingredient.name}</td>
                <td className="py-2.5 text-foreground-secondary">
                  {UNIT_LABEL[ingredient.defaultUnit]}
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
