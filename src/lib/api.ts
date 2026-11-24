import type {
  CalendarEntry,
  Ingredient,
  MealSlot,
  Recipe,
  RecipeStep,
  RegisterResponse,
  ShoppingItem,
  ShoppingList,
  StockItem,
  Unit,
  User,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// Le jeton d'accès est gardé en mémoire uniquement : invisible au JS tiers
// (pas de localStorage) et absent du DOM. Il est perdu au rechargement ;
// auth-context restaure la session via un refresh silencieux au montage.
let _accessToken: string | null = null;
// Déduplique les refreshs simultanés : si plusieurs requêtes échouent en 401
// en même temps, un seul appel à /api/auth/refresh est émis.
let _refreshPromise: Promise<boolean> | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

async function silentRefresh(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = fetch("/api/auth/refresh", { method: "POST" })
    .then(async (res) => {
      if (!res.ok) {
        _accessToken = null;
        return false;
      }
      const data = (await res.json()) as { access_token: string };
      _accessToken = data.access_token;
      return true;
    })
    .catch(() => {
      _accessToken = null;
      return false;
    })
    .finally(() => {
      _refreshPromise = null;
    });
  return _refreshPromise;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (_accessToken) headers.set("Authorization", `Bearer ${_accessToken}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !isRetry) {
    const refreshed = await silentRefresh();
    if (refreshed) return request<T>(path, options, true);
  }

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

async function proxyRequest(
  path: string,
  body: unknown,
): Promise<{ access_token: string }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      message = Array.isArray(data.message)
        ? data.message.join(", ")
        : (data.message ?? message);
    } catch {
      // pas de corps JSON exploitable
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as { access_token: string };
}

export const auth = {
  login: async (data: { email: string; password: string }): Promise<void> => {
    const { access_token } = await proxyRequest("/api/auth/login", data);
    _accessToken = access_token;
  },
  logout: async (): Promise<void> => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    _accessToken = null;
  },
  refresh: silentRefresh,
  me: () => request<User>("/auth/me"),
  register: (data: { email: string; pseudo: string; password: string }) =>
    request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  forgotPassword: (data: { email: string }) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resendVerification: (data: { email: string }) =>
    request<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const recipes = {
  list: (
    params?: { search?: string; page?: number; limit?: number },
    signal?: AbortSignal,
  ) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<Recipe[]>(`/recipes${suffix}`, { signal });
  },
  get: (id: string) => request<Recipe>(`/recipes/${id}`),
  create: (data: {
    title: string;
    description?: string;
    prepTimeMin?: number;
    cookTimeMin?: number;
    servings?: number;
    // À omettre quand il n'y a pas de source : l'API refuse `null` à la création.
    sourceUrl?: string;
    ingredients?: { ingredientId: string; quantity: number; unit: Unit }[];
    steps?: { stepOrder: number; instruction: string }[];
  }) =>
    request<Recipe>("/recipes", { method: "POST", body: JSON.stringify(data) }),
  // `sourceUrl` : une chaîne remplace la source, `null` l'efface, l'absence ne change rien.
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
  updateIngredient: (
    id: string,
    ingredientId: string,
    data: { quantity?: number; unit?: Unit },
  ) =>
    request(`/recipes/${id}/ingredients/${ingredientId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  removeIngredient: (id: string, ingredientId: string) =>
    request<void>(`/recipes/${id}/ingredients/${ingredientId}`, {
      method: "DELETE",
    }),
  replaceSteps: (
    id: string,
    steps: { stepOrder: number; instruction: string }[],
  ) =>
    request<RecipeStep[]>(`/recipes/${id}/steps`, {
      method: "PUT",
      body: JSON.stringify({ steps }),
    }),
};

export const ingredients = {
  list: () => request<Ingredient[]>("/ingredients"),
  create: (data: {
    name: string;
    defaultUnit: Unit;
    gramsPerTablespoon?: number;
  }) =>
    request<Ingredient>("/ingredients", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: { defaultUnit?: Unit; gramsPerTablespoon?: number },
  ) =>
    request<Ingredient>(`/ingredients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/ingredients/${id}`, { method: "DELETE" }),
};

export const calendar = {
  week: (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return request<CalendarEntry[]>(`/calendar/week${query}`);
  },
  range: (from: string, to: string) =>
    request<CalendarEntry[]>(`/calendar?from=${from}&to=${to}`),
  create: (data: {
    recipeId: string;
    plannedDate: string;
    mealSlot: MealSlot;
    servings: number;
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

export const shopping = {
  list: () => request<ShoppingList[]>("/shopping"),
  generate: async (periodStart: string, periodEnd: string) => {
    const result = await request<ShoppingList[] | ShoppingList>(
      "/shopping/generate",
      {
        method: "POST",
        body: JSON.stringify({ periodStart, periodEnd }),
      },
    );
    return Array.isArray(result) ? result : [result];
  },
  get: (id: string) => request<ShoppingList>(`/shopping/${id}`),
  toggleItem: (id: string, itemId: string, checked: boolean) =>
    request<ShoppingItem>(`/shopping/${id}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ checked }),
    }),
  validate: (id: string) =>
    request<ShoppingList>(`/shopping/${id}/validate`, { method: "POST" }),
  unvalidate: (id: string) =>
    request<ShoppingList>(`/shopping/${id}/unvalidate`, { method: "POST" }),
  remove: (id: string) =>
    request<void>(`/shopping/${id}`, { method: "DELETE" }),
};
