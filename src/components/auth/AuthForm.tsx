"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import { ApiError, auth } from "@/lib/api";

type Tab = "login" | "register";

const PSEUDO_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

export function AuthForm({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);

  // Renvoi de vérification
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSubmitting, setResendSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const tabListId = useId();
  const resendDialogId = useId();

  function switchTab(next: Tab) {
    setFormError(null);
    setShowResend(false);
    setResendMessage(null);
    setTab(next);
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
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    setFormError(null);
    setShowResend(false);
    setResendMessage(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        // 401 avec mention "valider" → email non vérifié → proposer le renvoi
        if (
          err.status === 401 &&
          err.message.toLowerCase().includes("valider")
        ) {
          setResendEmail(email);
          setShowResend(true);
        }
      } else {
        setFormError("Une erreur est survenue.");
      }
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
      const message = await register(email, pseudo, password);
      setRegisterMessage(message);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("resendEmail"));

    setResendError(null);
    setResendSubmitting(true);

    try {
      await auth.resendVerification({ email });
      setResendMessage(
        "Si cette adresse est associée à un compte, un email t'a été envoyé.",
      );
      setShowResend(false);
    } catch (err) {
      setResendError(
        err instanceof ApiError
          ? err.message
          : "Une erreur est survenue. Réessaie dans quelques instants.",
      );
    } finally {
      setResendSubmitting(false);
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

      {resendMessage && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-success/40 bg-success/5 px-3 py-2.5 text-sm text-success"
        >
          {resendMessage}
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
          <div className="flex flex-col gap-1.5">
            <Field
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Link
              href="/forgot-password"
              className="self-end text-xs text-foreground-secondary hover:text-foreground transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting ? "Connexion…" : "Se connecter"}
          </Button>

          {showResend && (
            <section
              aria-labelledby={`${resendDialogId}-title`}
              className="rounded-lg border border-border bg-surface-raised p-4 flex flex-col gap-3"
            >
              <p id={`${resendDialogId}-title`} className="text-sm font-medium">
                Renvoyer l&apos;email de vérification
              </p>

              {resendError && (
                <p
                  role="alert"
                  className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger"
                >
                  {resendError}
                </p>
              )}

              <form
                onSubmit={handleResend}
                className="flex flex-col gap-3"
                noValidate
              >
                <Field
                  label="Adresse email"
                  name="resendEmail"
                  type="email"
                  autoComplete="email"
                  defaultValue={resendEmail}
                  required
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={resendSubmitting}
                    className="flex-1"
                  >
                    {resendSubmitting ? "Envoi…" : "Renvoyer"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowResend(false);
                      setResendError(null);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </section>
          )}
        </form>
      ) : registerMessage ? (
        <div
          id={`${tabListId}-register-panel`}
          role="tabpanel"
          aria-labelledby={`${tabListId}-register-tab`}
          className="flex flex-col gap-4"
        >
          <p
            role="status"
            className="rounded-lg border border-success/40 bg-success/5 px-3 py-2.5 text-sm text-success"
          >
            {registerMessage}
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => switchTab("login")}
          >
            Aller à la connexion
          </Button>
        </div>
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
