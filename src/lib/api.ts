import { getToken } from "./token";
import type {
  AuthResponse,
  CalendarEntry,
  Ingredient,
  MealSlot,
  Recipe,
  RecipeStep,
  ShoppingItem,
  ShoppingList,
  StockItem,
  Unit,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      message = Array.isArray(body.message)
        ? body.message.join(", ")
        : (body.message ?? message);
    } catch {
      // pas de corps JSON exploitable, on garde le statusText
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ---- auth -----------------------------------------------------------

export const auth = {
  register: (data: { email: string; pseudo: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/auth/me"),
};

// ---- recipes ----------------------------------------------------------

export const recipes = {
  list: (params?: { search?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<Recipe[]>(`/recipes${suffix}`);
  },
  get: (id: string) => request<Recipe>(`/recipes/${id}`),
  create: (data: {
    title: string;
    description?: string;
    prepTimeMin?: number;
    cookTimeMin?: number;
    servings?: number;
    ingredients?: { ingredientId: string; quantity: number; unit: Unit }[];
    steps?: { stepOrder: number; instruction: string }[];
  }) =>
    request<Recipe>("/recipes", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Recipe>) =>
    request<Recipe>(`/recipes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => request<void>(`/recipes/${id}`, { method: "DELETE" }),
  addIngredient: (
    id: string,
    data: { ingredientId: string; quantity: number; unit: Unit },
  ) =>
    request(`/recipes/${id}/ingredients`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeIngredient: (id: string, ingredientId: string) =>
    request<void>(`/recipes/${id}/ingredients/${ingredientId}`, {
      method: "DELETE",
    }),
  replaceSteps: (id: string, steps: RecipeStep[]) =>
    request<RecipeStep[]>(`/recipes/${id}/steps`, {
      method: "PUT",
      body: JSON.stringify(steps),
    }),
};

// ---- ingredients (catalogue) -------------------------------------------

export const ingredients = {
  list: () => request<Ingredient[]>("/ingredients"),
  create: (data: { name: string; defaultUnit: Unit }) =>
    request<Ingredient>("/ingredients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/ingredients/${id}`, { method: "DELETE" }),
};

// ---- calendar -----------------------------------------------------------

export const calendar = {
  week: (date?: string) =>
    request<CalendarEntry[]>(`/calendar/week${date ? `?date=${date}` : ""}`),
  range: (from: string, to: string) =>
    request<CalendarEntry[]>(`/calendar?from=${from}&to=${to}`),
  create: (data: {
    recipeId: string;
    plannedDate: string;
    mealSlot: MealSlot;
  }) =>
    request<CalendarEntry>("/calendar", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  move: (id: string, data: { plannedDate: string; mealSlot: MealSlot }) =>
    request<CalendarEntry>(`/calendar/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  validate: (id: string, data: { done: boolean; actualRecipeId?: string }) =>
    request<CalendarEntry>(`/calendar/${id}/validate`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/calendar/${id}`, { method: "DELETE" }),
};

// ---- stock --------------------------------------------------------------

export const stock = {
  list: (expiringSoon?: boolean) =>
    request<StockItem[]>(`/stock${expiringSoon ? "?expiringSoon=true" : ""}`),
  create: (data: {
    ingredientId: string;
    quantity: number;
    unit: Unit;
    expiresAt?: string;
  }) =>
    request<StockItem>("/stock", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { quantity?: number; expiresAt?: string }) =>
    request<StockItem>(`/stock/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) => request<void>(`/stock/${id}`, { method: "DELETE" }),
};

// ---- shopping -------------------------------------------------------------

export const shopping = {
  list: () => request<ShoppingList[]>("/shopping"),
  generate: (weekStart: string) =>
    request<ShoppingList>("/shopping/generate", {
      method: "POST",
      body: JSON.stringify({ weekStart }),
    }),
  get: (id: string) => request<ShoppingList>(`/shopping/${id}`),
  toggleItem: (id: string, itemId: string, checked: boolean) =>
    request<ShoppingItem>(`/shopping/${id}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ checked }),
    }),
  validate: (id: string) =>
    request<void>(`/shopping/${id}/validate`, { method: "POST" }),
  remove: (id: string) =>
    request<void>(`/shopping/${id}`, { method: "DELETE" }),
};
