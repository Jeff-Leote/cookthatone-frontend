import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { ApiError, setAccessToken } from "../api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
  // Remet le token en mémoire à null entre chaque test.
  setAccessToken(null);
});

describe("AuthProvider — chargement initial", () => {
  it("ne charge pas de profil si le cookie est absent (refresh 401)", async () => {
    // /api/auth/refresh répond 401 → pas de session
    mockFetch.mockReturnValueOnce(makeResponse(401, { message: "No session" }));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.authError).toBe(false);
    // /auth/me ne doit pas être appelé
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("restaure le profil si le cookie est valide (refresh + me)", async () => {
    mockFetch
      // /api/auth/refresh → nouveau token d'accès
      .mockReturnValueOnce(
        makeResponse(200, { access_token: "new-access-token" }),
      )
      // /auth/me → profil
      .mockReturnValueOnce(
        makeResponse(200, { id: "1", email: "user@test.fr", pseudo: "sophie" }),
      );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toMatchObject({ email: "user@test.fr" });
    expect(result.current.authError).toBe(false);
  });

  it("lève authError si le backend est injoignable au montage", async () => {
    mockFetch
      // /api/auth/refresh réussit
      .mockReturnValueOnce(
        makeResponse(200, { access_token: "new-access-token" }),
      )
      // /auth/me : erreur réseau
      .mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.authError).toBe(true);
    expect(result.current.user).toBeNull();
  });
});

describe("AuthProvider — login", () => {
  it("appelle le proxy, stocke le token en mémoire et charge le profil", async () => {
    // Au montage : refresh échoue (pas de session)
    mockFetch
      .mockReturnValueOnce(makeResponse(401, { message: "No session" }))
      // login via le proxy
      .mockReturnValueOnce(
        makeResponse(200, { access_token: "access-after-login" }),
      )
      // /auth/me après login
      .mockReturnValueOnce(
        makeResponse(200, { id: "1", email: "user@test.fr", pseudo: "sophie" }),
      );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.login("user@test.fr", "motdepasse");
    await waitFor(() =>
      expect(result.current.user).toMatchObject({ email: "user@test.fr" }),
    );

    // Vérifie que le proxy a bien été appelé (pas le backend directement)
    const proxyCall = mockFetch.mock.calls.find(
      (c) => (c[0] as string) === "/api/auth/login",
    );
    expect(proxyCall).toBeDefined();
  });

  it("propage l'erreur si les identifiants sont invalides", async () => {
    mockFetch
      .mockReturnValueOnce(makeResponse(401, { message: "No session" }))
      .mockReturnValueOnce(
        makeResponse(401, { message: "Identifiants invalides" }),
      );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      result.current.login("user@test.fr", "mauvais"),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe("AuthProvider — logout", () => {
  it("appelle le proxy logout et déconnecte l'utilisateur", async () => {
    mockFetch
      .mockReturnValueOnce(
        makeResponse(200, { access_token: "new-access-token" }),
      )
      .mockReturnValueOnce(
        makeResponse(200, { id: "1", email: "user@test.fr", pseudo: "sophie" }),
      )
      // /api/auth/logout
      .mockReturnValueOnce(makeResponse(200, { ok: true }));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() =>
      expect(result.current.user).toMatchObject({ email: "user@test.fr" }),
    );

    result.current.logout();
    await waitFor(() => expect(result.current.user).toBeNull());
  });
});
