import type { Ingredient, Unit } from "./types";

// Mêmes familles que l'API (backend `src/common/units.ts`) : on ne propose
// que des unités que l'API sait convertir vers celle de l'ingrédient.
const MASS: Unit[] = ["G", "KG"];
const VOLUME: Unit[] = [
  "ML",
  "CL",
  "L",
  "CUILLERE_A_SOUPE",
  "CUILLERE_A_CAFE",
  "TASSE",
];
const UNIT_FAMILIES: Unit[][] = [MASS, VOLUME, ["PIECE"], ["PINCEE"]];

const SPOONS: Unit[] = ["CUILLERE_A_SOUPE", "CUILLERE_A_CAFE"];

// Avec le poids d'une cuillère à soupe renseigné, le poids et le volume de
// l'ingrédient deviennent convertibles (farine : 1 c. à soupe = 10 g). Sans lui,
// un ingrédient au poids accepte quand même les cuillères (repli de l'API :
// 1 g = 1 ml, soit 15 g la c. à soupe).
export function compatibleUnits(
  unit: Unit,
  gramsPerTablespoon?: number | null,
): Unit[] {
  const family = UNIT_FAMILIES.find((f) => f.includes(unit)) ?? [unit];
  if (gramsPerTablespoon && (family === MASS || family === VOLUME)) {
    return [...MASS, ...VOLUME];
  }
  if (family === MASS) return [...MASS, ...SPOONS];
  return family;
}

export function ingredientUnits(ingredient: Ingredient): Unit[] {
  return compatibleUnits(ingredient.defaultUnit, ingredient.gramsPerTablespoon);
}

// Ligne en cuillères pour un ingrédient au poids sans poids de cuillère : le
// calcul se fait avec l'estimation de 15 g la c. à soupe.
export function usesSpoonEstimate(
  ingredient: Ingredient,
  lineUnit: Unit,
): boolean {
  return (
    !ingredient.gramsPerTablespoon &&
    MASS.includes(ingredient.defaultUnit) &&
    SPOONS.includes(lineUnit)
  );
}

// Poids d'une cuillère à soupe indicatifs : à vérifier par l'utilisateur,
// jamais enregistrés sans sa validation.
export const EQUIVALENCE_EXAMPLES =
  "farine 10 g, sucre 15 g, huile 14 g, eau et lait 15 g, miel 21 g (cuillère rase, à vérifier)";
