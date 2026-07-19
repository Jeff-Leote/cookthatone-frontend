const TOKEN_KEY = "cookthatone_token";

/**
 * Stockage du JWT en localStorage — le backend ne pose pas de cookie
 * httpOnly (il renvoie access_token dans le corps de la réponse, voir
 * la skill cookthatone-api), donc le client doit le conserver lui-même
 * pour l'attacher en en-tête Authorization sur chaque requête.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
