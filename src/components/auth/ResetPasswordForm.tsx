"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { ApiError, auth } from "@/lib/api";

type State = "idle" | "loading" | "success";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fieldError, setFieldError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newPassword = String(data.get("newPassword"));

    if (newPassword.length < 8) {
      setFieldError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setFieldError(null);
    setErrorMessage(null);
    setState("loading");

    try {
      await auth.resetPassword({ token, newPassword });
      setState("success");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMessage("Ce lien est invalide ou a déjà été utilisé.");
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage(
          "Une erreur est survenue. Réessaie dans quelques instants.",
        );
      }
      setState("idle");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-heading text-xl font-medium mb-5">
        Nouveau mot de passe
      </h1>

      {state === "success" ? (
        <div className="flex flex-col gap-4">
          <p
            role="status"
            className="rounded-lg border border-success/40 bg-success/5 px-3 py-2.5 text-sm text-success"
          >
            Mot de passe réinitialisé. Tu peux maintenant te connecter.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors bg-accent text-accent-foreground hover:brightness-95"
          >
            Se connecter
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {errorMessage}
            </p>
          )}

          <Field
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            hint={fieldError ? undefined : "8 caractères minimum"}
            error={fieldError ?? undefined}
            required
          />

          <Button
            type="submit"
            disabled={state === "loading"}
            className="mt-1 w-full"
          >
            {state === "loading" ? "Réinitialisation…" : "Réinitialiser"}
          </Button>

          <Link
            href="/login"
            className="text-sm text-center text-foreground-secondary hover:text-foreground transition-colors"
          >
            Retour à la connexion
          </Link>
        </form>
      )}
    </Card>
  );
}
