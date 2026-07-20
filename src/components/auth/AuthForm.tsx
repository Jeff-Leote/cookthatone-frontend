"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

type Tab = "login" | "register";

const PSEUDO_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

// Connexion/Inscription sont deux routes distinctes (/login, /register) : le
// changement d'onglet démonte et remonte AuthForm, ce qui perd le focus
// clavier (rendu à <body>). Ce flag sessionStorage survit au remontage pour
// que le nouvel onglet actif puisse restaurer le focus lui-même au montage.
const TAB_SWITCH_FOCUS_KEY = "cookthatone:auth-tab-switch";

export function AuthForm({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const tabListId = useId();
  const loginTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(TAB_SWITCH_FOCUS_KEY) !== initialTab) return;
    sessionStorage.removeItem(TAB_SWITCH_FOCUS_KEY);
    (initialTab === "login" ? loginTabRef : registerTabRef).current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(next: Tab) {
    setFormError(null);
    setTab(next);
    sessionStorage.setItem(TAB_SWITCH_FOCUS_KEY, next);
    router.replace(next === "login" ? "/login" : "/register", {
      scroll: false,
    });
  }

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      switchTab(tab === "login" ? "register" : "login");
    }
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setFormError(null);
    setSubmitting(true);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      router.push("/dashboard");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const pseudo = String(data.get("pseudo"));
    const password = String(data.get("password"));
    const confirmPassword = String(data.get("confirmPassword"));

    setFormError(null);

    if (!PSEUDO_PATTERN.test(pseudo)) {
      setFormError(
        "Le pseudo doit faire 3 à 20 caractères (lettres, chiffres, underscore).",
      );
      return;
    }
    if (password.length < 8) {
      setFormError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, pseudo, password);
      router.push("/dashboard");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <div
        role="tablist"
        aria-label="Authentification"
        className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-raised p-1"
      >
        <button
          ref={loginTabRef}
          type="button"
          role="tab"
          id={`${tabListId}-login-tab`}
          aria-selected={tab === "login"}
          aria-controls={`${tabListId}-login-panel`}
          tabIndex={tab === "login" ? 0 : -1}
          onClick={() => switchTab("login")}
          onKeyDown={handleTabKeyDown}
          className={`rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "login"
              ? "bg-surface text-foreground"
              : "text-foreground-secondary"
          }`}
        >
          Connexion
        </button>
        <button
          ref={registerTabRef}
          type="button"
          role="tab"
          id={`${tabListId}-register-tab`}
          aria-selected={tab === "register"}
          aria-controls={`${tabListId}-register-panel`}
          tabIndex={tab === "register" ? 0 : -1}
          onClick={() => switchTab("register")}
          onKeyDown={handleTabKeyDown}
          className={`rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "register"
              ? "bg-surface text-foreground"
              : "text-foreground-secondary"
          }`}
        >
          Inscription
        </button>
      </div>

      {formError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {formError}
        </p>
      )}

      {tab === "login" ? (
        <form
          id={`${tabListId}-login-panel`}
          role="tabpanel"
          aria-labelledby={`${tabListId}-login-tab`}
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field
            label="Adresse email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      ) : (
        <form
          id={`${tabListId}-register-panel`}
          role="tabpanel"
          aria-labelledby={`${tabListId}-register-tab`}
          onSubmit={handleRegister}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field
            label="Adresse email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Pseudo"
            name="pseudo"
            type="text"
            autoComplete="username"
            placeholder="ex. sophie_cuisine"
            hint="3 à 20 caractères, lettres/chiffres/underscore uniquement"
            minLength={3}
            maxLength={20}
            required
          />
          <Field
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Field
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? "Création…" : "Créer mon compte"}
          </Button>
        </form>
      )}
    </Card>
  );
}
