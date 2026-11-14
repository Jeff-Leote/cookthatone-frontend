"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, auth } from "./api";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Le refresh a échoué pour une raison autre qu'une session absente ou
   * expirée (backend injoignable, panne réseau) — distinct de « non
   * authentifié » : ne redirige pas vers /login, propose seulement de
   * réessayer. */
  authError: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Ne connecte plus automatiquement : le compte doit d'abord être validé
   * par email. Retourne le message de confirmation à afficher. */
  register: (
    email: string,
    pseudo: string,
    password: string,
  ) => Promise<string>;
  logout: () => void;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Tente un refresh silencieux au montage pour restaurer la session depuis
  // le cookie httpOnly cto_refresh. Si le cookie est absent ou expiré,
  // refresh() renvoie false et on reste déconnecté (pas d'erreur affichée).
  useEffect(() => {
    let cancelled = false;

    async function loadInitialUser() {
      setLoading(true);
      setAuthError(false);
      try {
        const refreshed = await auth.refresh();
        if (!refreshed) {
          if (!cancelled) setLoading(false);
          return;
        }
        const me = await auth.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        // Un 401 après un refresh réussi est inattendu ; toute autre panne
        // réseau ne doit pas effacer la tentative : on signale sans rediriger.
        if (err instanceof ApiError && err.status === 401) {
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
    await auth.login({ email, password });
    const me = await auth.me();
    setUser(me);
  }, []);

  const register = useCallback(
    async (email: string, pseudo: string, password: string) => {
      const { message } = await auth.register({ email, pseudo, password });
      return message;
    },
    [],
  );

  const logout = useCallback(() => {
    void auth.logout();
    setUser(null);
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const value = useMemo(
    () => ({ user, loading, authError, login, register, logout, retry }),
    [user, loading, authError, login, register, logout, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}
