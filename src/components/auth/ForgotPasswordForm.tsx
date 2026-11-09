"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { ApiError, auth } from "@/lib/api";

type State = "idle" | "loading" | "success" | "error";

export function ForgotPasswordForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));

    setErrorMessage(null);
    setState("loading");

    try {
      await auth.forgotPassword({ email });
      setState("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          "Une erreur est survenue. Réessaie dans quelques instants.",
        );
      }
      setState("error");
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="font-heading text-xl font-medium mb-5">
        Mot de passe oublié
      </h1>

      {state === "success" ? (
        <div className="flex flex-col gap-4">
          <p
            role="status"
            className="rounded-lg border border-success/40 bg-success/5 px-3 py-2.5 text-sm text-success"
          >
            Si cette adresse est associée à un compte, un email t&apos;a été
            envoyé.
          </p>
          <Link
            href="/login"
            className="text-sm text-center text-foreground-secondary hover:text-foreground transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <p className="text-sm text-foreground-secondary">
            Saisis ton adresse email et nous t&apos;enverrons un lien pour
            réinitialiser ton mot de passe.
          </p>

          {state === "error" && errorMessage && (
            <p
              role="alert"
              className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {errorMessage}
            </p>
          )}

          <Field
            label="Adresse email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />

          <Button
            type="submit"
            disabled={state === "loading"}
            className="mt-1 w-full"
          >
            {state === "loading" ? "Envoi en cours…" : "Envoyer le lien"}
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
