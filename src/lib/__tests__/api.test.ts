import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth, setAccessToken } from "../api";

// Réinitialise le token d'accès en mémoire avant chaque test.
// _refreshPromise se remet à null dans le finally de silentRefresh()
// après chaque appel complet, donc aucun export supplémentaire n'est nécessaire.
beforeEach(() => {
  setAccessToken(null);
  vi.restoreAllMocks();
});

describe("api — déduplication du refresh silencieux", () => {
  it("n'émet qu'un seul appel à /api/auth/refresh quand plusieurs requêtes reçoivent un 401 simultanément", async () => {
    // Compteurs pour maîtriser les séquences d'appels
    let refreshCallCount = 0;
    // Les deux appels à /auth/me vont d'abord recevoir 401 (token null),
    // déclencher silentRefresh(), puis être retentés avec le nouveau token.
    let meCallCount = 0;

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      // Appel vers le proxy de refresh
      if (url === "/api/auth/refresh") {
        refreshCallCount += 1;
        if (refreshCallCount > 1) {
          // Si le refresh est appelé plus d'une fois, la déduplication a échoué.
          return Promise.reject(new Error("refresh appelé plus d'une fois"));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.resolve({ access_token: "refreshed-token" }),
        } as Response);
      }

      // Appels vers le backend (/auth/me via API_URL = http://localhost:3000)
      if (typeof url === "string" && url.includes("/auth/me")) {
        meCallCount += 1;
        // Les deux premiers appels (sans token) reçoivent 401 pour déclencher
        // le refresh. Les suivants (après retry avec le nouveau token) réussissent.
        if (meCallCount <= 2) {
          return Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () => Promise.resolve({ message: "Unauthorized" }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () =>
            Promise.resolve({
              id: "1",
              email: "user@test.fr",
              pseudo: "sophie",
            }),
        } as Response);
      }

      return Promise.reject(new Error(`URL non gérée par le mock : ${url}`));
    });

    vi.stubGlobal("fetch", mockFetch);

    // Les deux appels simultanés à auth.me() reçoivent 401 et déclenchent
    // silentRefresh() en même temps. La déduplication via _refreshPromise
    // garantit qu'un seul fetch vers /api/auth/refresh est émis.
    const [result1, result2] = await Promise.all([auth.me(), auth.me()]);

    expect(result1).toMatchObject({ id: "1" });
    expect(result2).toMatchObject({ id: "1" });

    // Vérification centrale : un seul appel au proxy de refresh
    const refreshCalls = mockFetch.mock.calls.filter(
      (call) => call[0] === "/api/auth/refresh",
    );
    expect(refreshCalls).toHaveLength(1);
  });
});
