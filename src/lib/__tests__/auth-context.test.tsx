import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../auth-context";
import { ApiError } from "../api";

// Intercepte fetch pour simuler les réponses du backend.
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
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("AuthProvider — chargement initial", () => {
  it("ne charge pas de profil si aucun token", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.authError).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("charge le profil si un token valide est présent", async () => {
    localStorage.setItem("cookthatone_token", "valid-token");
    mockFetch.mockReturnValueOnce(
      makeResponse(200, { id: "1", email: "user@test.fr", pseudo: "sophie" }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toMatchObject({ email: "user@test.fr" });
    expect(result.current.authError).toBe(false);
  });

  it("déconnecte l'utilisateur sur une erreur 401", async () => {
    localStorage.setItem("cookthatone_token", "expired-token");
    mockFetch.mockReturnValueOnce(
      makeResponse(401, { message: "Unauthorized" }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.authError).toBe(false);
    expect(localStorage.getItem("cookthatone_token")).toBeNull();
  });

  it("lève authError sans effacer le token si le backend est injoignable", async () => {
    localStorage.setItem("cookthatone_token", "valid-token");
    mockFetch.mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.authError).toBe(true);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("cookthatone_token")).toBe("valid-token");
  });
});

describe("AuthProvider — login", () => {
  it("stocke le token et charge le profil après une connexion réussie", async () => {
    mockFetch
      .mockReturnValueOnce(makeResponse(200, { access_token: "new-token" }))
      .mockReturnValueOnce(
        makeResponse(200, { id: "1", email: "user@test.fr", pseudo: "sophie" }),
      );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.login("user@test.fr", "motdepasse");
    expect(localStorage.getItem("cookthatone_token")).toBe("new-token");
    await waitFor(() =>
      expect(result.current.user).toMatchObject({ email: "user@test.fr" }),
    );
  });

  it("propage l'erreur si les identifiants sont invalides", async () => {
    mockFetch.mockReturnValueOnce(
      makeResponse(401, { message: "Identifiants invalides" }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(
      result.current.login("user@test.fr", "mauvais"),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
