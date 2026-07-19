"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import {
  ApiError,
  ingredients as ingredientsApi,
  recipes as recipesApi,
} from "@/lib/api";
import { UNIT_LABEL } from "@/lib/format";
import type { Ingredient, Unit } from "@/lib/types";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

interface IngredientRow {
  key: string;
  ingredientId: string;
  quantity: string;
  unit: Unit;
}

interface StepRow {
  key: string;
  instruction: string;
}

function newKey() {
  return crypto.randomUUID();
}

export function RecipeForm({ recipeId }: { recipeId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(recipeId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTimeMin, setPrepTimeMin] = useState("");
  const [cookTimeMin, setCookTimeMin] = useState("");
  const [servings, setServings] = useState("4");
  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>([]);
  const [stepRows, setStepRows] = useState<StepRow[]>([]);
  const [originalIngredientIds, setOriginalIngredientIds] = useState<
    Set<string>
  >(new Set());

  const [catalogue, setCatalogue] = useState<Ingredient[] | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ingredientsApi
      .list()
      .then(setCatalogue)
      .catch(() => setCatalogue([]));
  }, []);

  useEffect(() => {
    if (!recipeId) return;
    let cancelled = false;
    recipesApi
      .get(recipeId)
      .then((r) => {
        if (cancelled) return;
        setTitle(r.title);
        setDescription(r.description ?? "");
        setPrepTimeMin(r.prepTimeMin?.toString() ?? "");
        setCookTimeMin(r.cookTimeMin?.toString() ?? "");
        setServings(r.servings.toString());
        const rows =
          r.recipeIngredients?.map((ri) => ({
            key: newKey(),
            ingredientId: ri.ingredientId,
            quantity: ri.quantity.toString(),
            unit: ri.unit,
          })) ?? [];
        setIngredientRows(rows);
        setOriginalIngredientIds(new Set(rows.map((row) => row.ingredientId)));
        setStepRows(
          [...(r.steps ?? [])]
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((s) => ({ key: newKey(), instruction: s.instruction })),
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger cette recette.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [recipeId]);

  function addIngredientRow() {
    setIngredientRows((rows) => [
      ...rows,
      {
        key: newKey(),
        ingredientId: catalogue?.[0]?.id ?? "",
        quantity: "1",
        unit: catalogue?.[0]?.defaultUnit ?? "G",
      },
    ]);
  }

  function updateIngredientRow(key: string, patch: Partial<IngredientRow>) {
    setIngredientRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function removeIngredientRow(key: string) {
    setIngredientRows((rows) => rows.filter((row) => row.key !== key));
  }

  function addStepRow() {
    setStepRows((rows) => [...rows, { key: newKey(), instruction: "" }]);
  }

  function updateStepRow(key: string, instruction: string) {
    setStepRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, instruction } : row)),
    );
  }

  function removeStepRow(key: string) {
    setStepRows((rows) => rows.filter((row) => row.key !== key));
  }

  function moveStepRow(index: number, direction: -1 | 1) {
    setStepRows((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    const validIngredientRows = ingredientRows.filter(
      (row) => row.ingredientId && Number(row.quantity) > 0,
    );
    const steps = stepRows
      .filter((row) => row.instruction.trim())
      .map((row, index) => ({
        stepOrder: index + 1,
        instruction: row.instruction.trim(),
      }));

    setSubmitting(true);
    try {
      if (isEdit && recipeId) {
        await recipesApi.update(recipeId, {
          title: title.trim(),
          description: description.trim() || undefined,
          prepTimeMin: prepTimeMin ? Number(prepTimeMin) : undefined,
          cookTimeMin: cookTimeMin ? Number(cookTimeMin) : undefined,
          servings: Number(servings),
        });

        const currentIds = new Set(
          validIngredientRows.map((row) => row.ingredientId),
        );
        const toRemove = [...originalIngredientIds].filter(
          (id) => !currentIds.has(id),
        );
        const toAdd = validIngredientRows.filter(
          (row) => !originalIngredientIds.has(row.ingredientId),
        );
        await Promise.all([
          ...toRemove.map((id) => recipesApi.removeIngredient(recipeId, id)),
          ...toAdd.map((row) =>
            recipesApi.addIngredient(recipeId, {
              ingredientId: row.ingredientId,
              quantity: Number(row.quantity),
              unit: row.unit,
            }),
          ),
        ]);
        await recipesApi.replaceSteps(recipeId, steps);
        router.push(`/recipes/${recipeId}`);
      } else {
        const created = await recipesApi.create({
          title: title.trim(),
          description: description.trim() || undefined,
          prepTimeMin: prepTimeMin ? Number(prepTimeMin) : undefined,
          cookTimeMin: cookTimeMin ? Number(cookTimeMin) : undefined,
          servings: Number(servings),
          ingredients: validIngredientRows.map((row) => ({
            ingredientId: row.ingredientId,
            quantity: Number(row.quantity),
            unit: row.unit,
          })),
          steps,
        });
        router.push(`/recipes/${created.id}`);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p role="status" className="text-sm text-foreground-secondary">
        Chargement…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <Link
          href={isEdit && recipeId ? `/recipes/${recipeId}` : "/recipes"}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">←</span> Retour
        </Link>
        <h1 className="font-heading text-2xl font-medium">
          {isEdit ? "Modifier la recette" : "Nouvelle recette"}
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

      <Card className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">
          Informations
        </h2>
        <Field
          label="Titre"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-xs font-medium uppercase tracking-wide text-foreground-secondary"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:border-accent"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field
            label="Prépa (min)"
            type="number"
            min={0}
            value={prepTimeMin}
            onChange={(e) => setPrepTimeMin(e.target.value)}
          />
          <Field
            label="Cuisson (min)"
            type="number"
            min={0}
            value={cookTimeMin}
            onChange={(e) => setCookTimeMin(e.target.value)}
          />
          <Field
            label="Portions"
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">
          Ingrédients
        </h2>
        {catalogue && catalogue.length === 0 && (
          <p className="text-sm text-foreground-secondary">
            Ton catalogue d&apos;ingrédients est vide.{" "}
            <Link href="/recipes/ingredients" className="text-accent">
              Ajoute des ingrédients
            </Link>{" "}
            avant d&apos;en associer à cette recette.
          </p>
        )}
        {ingredientRows.map((row) => (
          <div key={row.key} className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-36 flex-1 flex-col gap-1.5">
              <label htmlFor={`ing-${row.key}`} className="sr-only">
                Ingrédient
              </label>
              <select
                id={`ing-${row.key}`}
                value={row.ingredientId}
                onChange={(e) =>
                  updateIngredientRow(row.key, { ingredientId: e.target.value })
                }
                className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus-visible:border-accent"
              >
                {catalogue?.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-20 flex-col gap-1.5">
              <label htmlFor={`qty-${row.key}`} className="sr-only">
                Quantité
              </label>
              <input
                id={`qty-${row.key}`}
                type="number"
                min={0}
                step="any"
                value={row.quantity}
                onChange={(e) =>
                  updateIngredientRow(row.key, { quantity: e.target.value })
                }
                className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus-visible:border-accent"
              />
            </div>
            <div className="flex w-28 flex-col gap-1.5">
              <label htmlFor={`unit-${row.key}`} className="sr-only">
                Unité
              </label>
              <select
                id={`unit-${row.key}`}
                value={row.unit}
                onChange={(e) =>
                  updateIngredientRow(row.key, {
                    unit: e.target.value as Unit,
                  })
                }
                className="w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus-visible:border-accent"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABEL[u]}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeIngredientRow(row.key)}
              aria-label="Retirer cet ingrédient"
            >
              <span aria-hidden="true">✕</span>
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addIngredientRow}
          disabled={!catalogue || catalogue.length === 0}
          className="self-start"
        >
          <span aria-hidden="true">+</span> Ajouter un ingrédient
        </Button>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">
          Étapes
        </h2>
        {stepRows.map((row, index) => (
          <div key={row.key} className="flex flex-wrap items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent"
            >
              {index + 1}
            </span>
            <label htmlFor={`step-${row.key}`} className="sr-only">
              Étape {index + 1}
            </label>
            <textarea
              id={`step-${row.key}`}
              rows={2}
              value={row.instruction}
              onChange={(e) => updateStepRow(row.key, e.target.value)}
              placeholder={`Étape ${index + 1}…`}
              className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus-visible:border-accent"
            />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => moveStepRow(index, -1)}
                disabled={index === 0}
                aria-label={`Monter l'étape ${index + 1}`}
                className="px-2 py-1"
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => moveStepRow(index, 1)}
                disabled={index === stepRows.length - 1}
                aria-label={`Descendre l'étape ${index + 1}`}
                className="px-2 py-1"
              >
                ↓
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeStepRow(row.key)}
              aria-label={`Retirer l'étape ${index + 1}`}
            >
              <span aria-hidden="true">✕</span>
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addStepRow}
          className="self-start"
        >
          <span aria-hidden="true">+</span> Ajouter une étape
        </Button>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          <span aria-hidden="true">✓</span>{" "}
          {submitting ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
