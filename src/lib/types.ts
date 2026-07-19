export type Unit =
  | "G"
  | "KG"
  | "ML"
  | "L"
  | "PIECE"
  | "CUILLERE_A_SOUPE"
  | "CUILLERE_A_CAFE"
  | "TASSE"
  | "PINCEE";

export type MealSlot = "MIDI" | "SOIR";

export interface User {
  id: string;
  email: string;
  pseudo: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface Ingredient {
  id: string;
  name: string;
  defaultUnit: Unit;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  ingredient?: Ingredient;
}

export interface RecipeStep {
  id: string;
  stepOrder: number;
  instruction: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  servings: number;
  createdAt: string;
  updatedAt: string;
  recipeIngredients?: RecipeIngredient[];
  steps?: RecipeStep[];
}

export interface CalendarEntry {
  id: string;
  recipeId: string;
  plannedDate: string;
  mealSlot: MealSlot;
  done: boolean;
  actualRecipeId: string | null;
  validatedAt: string | null;
  createdAt: string;
  recipe?: Recipe;
  actualRecipe?: Recipe | null;
}

export interface StockItem {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
  expiresAt: string | null;
  updatedAt: string;
  ingredient?: Ingredient;
}

export interface ShoppingItem {
  id: string;
  ingredientId: string;
  quantityNeeded: number;
  quantityInStock: number;
  unit: Unit;
  checked: boolean;
  ingredient?: Ingredient;
}

export interface ShoppingList {
  id: string;
  weekStart: string;
  validated: boolean;
  createdAt: string;
  items?: ShoppingItem[];
}
