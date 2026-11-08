"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { recipes as recipesApi } from "@/lib/api";
import type { Recipe } from "@/lib/types";

const MIN_SEARCH_LENGTH = 3;
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

interface RecipePickerDialogProps {
  open: boolean;
  title: string;
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

interface SearchResult {
  term: string;
  items: Recipe[];
  page: number;
  hasMore: boolean;
  failed: boolean;
}

async function fetchPage(
  term: string,
  page: number,
  cache: Map<string, Recipe[]>,
  signal?: AbortSignal,
) {
  const key = `${term.toLowerCase()}|${page}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const items = await recipesApi.list(
    { search: term, page, limit: PAGE_SIZE },
    signal,
  );
  cache.set(key, items);
  return items;
}

/**
 * Utilise <dialog> natif plutôt qu'une modale maison : piégeage du focus,
 * fermeture au clavier (Échap) et état "inert" du reste de la page sont
 * gérés nativement par le navigateur (RGAA 12.8 / 12.11).
 *
 * Éco-conception : rien n'est chargé avant que l'utilisateur tape au moins
 * 3 lettres ; la requête suit la saisie avec un délai et la précédente est
 * annulée ; les résultats arrivent par pages de 10 sur demande et sont
 * gardés en mémoire tant que la boîte reste ouverte.
 */
export function RecipePickerDialog({
  open,
  title,
  onSelect,
  onClose,
}: RecipePickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef(new Map<string, Recipe[]>());
  const hintId = useId();

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const term = query.trim();
  const tooShort = term.length < MIN_SEARCH_LENGTH;
  const pending = !tooShort && (result === null || result.term !== term);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || term.length < MIN_SEARCH_LENGTH) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchPage(term, 1, cacheRef.current, controller.signal)
        .then((items) => {
          setMoreFailed(false);
          setResult({
            term,
            items,
            page: 1,
            hasMore: items.length === PAGE_SIZE,
            failed: false,
          });
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setResult({ term, items: [], page: 1, hasMore: false, failed: true });
        });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, term, attempt]);

  function reset() {
    setQuery("");
    setResult(null);
    setLoadingMore(false);
    setMoreFailed(false);
    cacheRef.current.clear();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSelect(recipe: Recipe) {
    reset();
    onSelect(recipe);
  }

  function retry() {
    cacheRef.current.clear();
    setResult(null);
    setAttempt((n) => n + 1);
  }

  async function loadMore() {
    if (!result || loadingMore) return;
    setLoadingMore(true);
    setMoreFailed(false);
    try {
      const items = await fetchPage(
        result.term,
        result.page + 1,
        cacheRef.current,
      );
      setResult((current) => {
        if (!current || current.term !== result.term) return current;
        const known = new Set(current.items.map((r) => r.id));
        return {
          ...current,
          items: [...current.items, ...items.filter((r) => !known.has(r.id))],
          page: current.page + 1,
          hasMore: items.length === PAGE_SIZE,
        };
      });
    } catch {
      setMoreFailed(true);
    } finally {
      setLoadingMore(false);
    }
  }

  let announcement = "";
  if (pending) announcement = "Recherche en cours.";
  else if (result && !tooShort && !result.failed) {
    announcement =
      result.items.length === 0
        ? "Aucune recette trouvée."
        : `${result.items.length} recette${result.items.length > 1 ? "s" : ""} affichée${result.items.length > 1 ? "s" : ""}.`;
  }

  return (
    <dialog
      ref={dialogRef}
      // "cancel" ne se declenche que sur une fermeture voulue par
      // l'utilisateur (touche Echap) ; "close" se declenche aussi pour une
      // fermeture programmatique (ex: on enchaine sur une autre boite de
      // dialogue apres avoir choisi une recette), qu'on ne veut pas traiter
      // comme une annulation.
      onCancel={handleClose}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-medium">{title}</h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground-secondary hover:text-foreground"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 border-b border-border px-5 py-3">
        <label htmlFor={`${hintId}-search`} className="sr-only">
          Rechercher une recette par son nom
        </label>
        <input
          ref={inputRef}
          id={`${hintId}-search`}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom de la recette"
          autoComplete="off"
          aria-describedby={hintId}
          className="min-h-11 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/60 focus-visible:border-accent"
        />
        <p id={hintId} className="text-xs text-foreground-secondary">
          Tape au moins {MIN_SEARCH_LENGTH} lettres : la recherche porte sur
          toutes tes recettes.
        </p>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div className="max-h-80 overflow-y-auto p-2">
        {tooShort && (
          <p className="px-3 py-4 text-sm text-foreground-secondary">
            Commence à taper le nom d&apos;une recette.
          </p>
        )}

        {pending && (
          <p className="px-3 py-4 text-sm text-foreground-secondary">
            Recherche…
          </p>
        )}

        {!tooShort && !pending && result?.failed && (
          <div role="alert" className="flex flex-col gap-3 px-3 py-4">
            <p className="text-sm text-danger">
              Impossible de chercher les recettes pour le moment.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={retry}
              className="min-h-11"
            >
              Réessayer
            </Button>
          </div>
        )}

        {!tooShort && !pending && result && !result.failed && (
          <>
            {result.items.length === 0 ? (
              <p className="px-3 py-4 text-sm text-foreground-secondary">
                Aucune recette ne correspond à « {result.term} ».
              </p>
            ) : (
              <ul>
                {result.items.map((recipe) => (
                  <li key={recipe.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(recipe)}
                      className="min-h-11 w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-surface-raised"
                    >
                      {recipe.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {result.hasMore && (
              <div className="flex flex-col gap-2 px-1 pt-2">
                {moreFailed && (
                  <p role="alert" className="px-2 text-xs text-danger">
                    Impossible de charger la suite.
                  </p>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-h-11"
                >
                  {loadingMore ? "Chargement…" : "Afficher plus de recettes"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
