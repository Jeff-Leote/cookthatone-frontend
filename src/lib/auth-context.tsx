"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ApiError, auth } from "./api";
import { clearToken, getToken, setToken } from "./token";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Le token existe mais son statut n'a pas pu être vérifié (backend
   * injoignable) — distinct de "non authentifié" : ne doit pas rediriger
   * vers /login, seulement proposer de réessayer. */
  authError: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, pseudo: string, password: string) => Promise<void>;
  logout: () => void;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Charge le profil au montage à partir du token déjà stocké, le cas
  // échéant. Le drapeau `cancelled` évite un setState après démontage
  // (changement de page pendant que la requête est en vol).
  useEffect(() => {
    let cancelled = false;

    async function loadInitialUser() {
      setLoading(true);
      setAuthError(false);
      if (!getToken()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const me = await auth.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        // Un token vraiment invalide/expiré (401) déconnecte
        // l'utilisateur. Toute autre erreur (backend injoignable, panne
        // réseau passagère) ne doit pas effacer une session valide —
        // on le signale sans toucher au token.
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          if (!cancelled) setUser(null);
        } else if (!cancelled) {
          setAuthError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInitialUser();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await auth.login({ email, password });
    setToken(access_token);
    const me = await auth.me();
    setUser(me);
  }, []);

  const register = useCallback(
    async (email: string, pseudo: string, password: string) => {
      const { access_token } = await auth.register({
        email,
        pseudo,
        password,
      });
      setToken(access_token);
      const me = await auth.me();
      setUser(me);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, authError, login, register, logout, retry }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
