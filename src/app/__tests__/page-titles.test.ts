/// <reference types="vitest/globals" />

/**
 * Vérifie que chaque route de l'application exporte un titre non vide
 * et que tous les titres sont distincts.
 *
 * Approche : import statique des métadonnées de chaque layout de segment
 * (ou de la page quand elle est serveur). Pas de rendu DOM nécessaire.
 */

import { metadata as dashboardMeta } from "../(app)/dashboard/layout";
import { metadata as recipesMeta } from "../(app)/recipes/layout";
import { metadata as newRecipeMeta } from "../(app)/recipes/new/page";
import { metadata as ingredientsMeta } from "../(app)/recipes/ingredients/layout";
import { metadata as recipeDetailMeta } from "../(app)/recipes/[id]/layout";
import { metadata as editRecipeMeta } from "../(app)/recipes/[id]/edit/layout";
import { metadata as calendarMeta } from "../(app)/calendar/layout";
import { metadata as stockMeta } from "../(app)/stock/layout";
import { metadata as shoppingMeta } from "../(app)/shopping/layout";
import { metadata as profileMeta } from "../(app)/profile/layout";

const allMeta = [
  { route: "/dashboard", meta: dashboardMeta },
  { route: "/recipes", meta: recipesMeta },
  { route: "/recipes/new", meta: newRecipeMeta },
  { route: "/recipes/ingredients", meta: ingredientsMeta },
  { route: "/recipes/[id]", meta: recipeDetailMeta },
  { route: "/recipes/[id]/edit", meta: editRecipeMeta },
  { route: "/calendar", meta: calendarMeta },
  { route: "/stock", meta: stockMeta },
  { route: "/shopping", meta: shoppingMeta },
  { route: "/profile", meta: profileMeta },
];

describe("Titres de page", () => {
  it.each(allMeta)("la route $route exporte un titre non vide", ({ meta }) => {
    expect(meta).toBeDefined();
    const title = meta.title;
    expect(typeof title).toBe("string");
    expect((title as string).length).toBeGreaterThan(0);
  });

  it("tous les titres sont distincts", () => {
    const titles = allMeta.map(({ meta }) => meta.title as string);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });
});
