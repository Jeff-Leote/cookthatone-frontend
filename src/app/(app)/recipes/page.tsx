"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { recipes as recipesApi } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Recipe } from "@/lib/types";

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [items, setItems] = useState<Recipe[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    recipesApi
      .list(debouncedSearch ? { search: debouncedSearch } : undefined)
      .then((r) => {
        if (cancelled) return;
        setItems(r);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-medium">Recettes</h1>
        <div className="flex gap-2">
          <Link
            href="/recipes/ingredients"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm text-foreground hover:border-border-strong"
          >
            <span aria-hidden="true">📦</span> Ingrédients
          </Link>
          <Link
            href="/recipes/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground hover:brightness-95"
          >
            <span aria-hidden="true">+</span> Nouvelle recette
          </Link>
        </div>
      </div>

      <div>
        <label htmlFor="recipe-search" className="sr-only">
          Rechercher une recette
        </label>
        <input
          id="recipe-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une recette…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary focus-visible:border-accent"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          Impossible de charger les recettes. Réessaie plus tard.
        </p>
      )}

      {!error && items === null && (
        <p role="status" className="text-sm text-foreground-secondary">
          Chargement…
        </p>
      )}

      {!error && items !== null && items.length === 0 && (
        <p className="text-sm text-foreground-secondary">
          {search
            ? "Aucune recette ne correspond à ta recherche."
            : "Aucune recette pour l'instant — commence par en créer une."}
        </p>
      )}

      {!error && items !== null && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
