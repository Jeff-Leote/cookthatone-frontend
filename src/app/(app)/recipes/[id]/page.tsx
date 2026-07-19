"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { recipes as recipesApi } from "@/lib/api";
import { UNIT_LABEL } from "@/lib/format";
import type { Recipe } from "@/lib/types";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    recipesApi
      .get(params.id)
      .then((r) => {
        if (!cancelled) {
          setRecipe(r);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  async function handleDelete() {
    if (!recipe) return;
    if (
      !window.confirm(
        `Supprimer définitivement la recette « ${recipe.title} » ?`,
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await recipesApi.remove(recipe.id);
      router.push("/recipes");
    } catch {
      setDeleting(false);
      setError(true);
    }
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        Impossible de charger cette recette.
      </p>
    );
  }

  if (!recipe) {
    return (
      <p role="status" className="text-sm text-foreground-secondary">
        Chargement…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/recipes"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Toutes les recettes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-medium">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="mt-1 text-sm text-foreground-secondary">
                {recipe.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/recipes/${recipe.id}/edit`}>
              <Button variant="secondary">
                <span aria-hidden="true">✏️</span> Modifier
              </Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              <span aria-hidden="true">🗑️</span>{" "}
              {deleting ? "Suppression…" : "Supprimer"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {recipe.prepTimeMin !== null && (
          <Card className="min-w-32">
            <p className="text-xs text-foreground-secondary">Préparation</p>
            <p className="font-medium">{recipe.prepTimeMin} min</p>
          </Card>
        )}
        {recipe.cookTimeMin !== null && (
          <Card className="min-w-32">
            <p className="text-xs text-foreground-secondary">Cuisson</p>
            <p className="font-medium">{recipe.cookTimeMin} min</p>
          </Card>
        )}
        <Card className="min-w-32">
          <p className="text-xs text-foreground-secondary">Portions</p>
          <p className="font-medium">{recipe.servings}</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-heading text-lg font-medium">Ingrédients</h2>
          {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {recipe.recipeIngredients.map((ri) => (
                <li
                  key={ri.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm"
                >
                  <span>{ri.ingredient?.name ?? "Ingrédient"}</span>
                  <span className="text-foreground-secondary">
                    {ri.quantity} {UNIT_LABEL[ri.unit] ?? ri.unit}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground-secondary">
              Aucun ingrédient renseigné.
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-3 font-heading text-lg font-medium">Étapes</h2>
          {recipe.steps && recipe.steps.length > 0 ? (
            <ol className="flex flex-col gap-3">
              {[...recipe.steps]
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step) => (
                  <li key={step.id} className="flex gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent"
                    >
                      {step.stepOrder}
                    </span>
                    <span>{step.instruction}</span>
                  </li>
                ))}
            </ol>
          ) : (
            <p className="text-sm text-foreground-secondary">
              Aucune étape renseignée.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
