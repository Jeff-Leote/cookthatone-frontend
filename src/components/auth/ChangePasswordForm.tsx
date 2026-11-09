"use client";

import { useState, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ApiError, auth } from "@/lib/api";

type State = "idle" | "loading" | "success";

export function ChangePasswordForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const currentPassword = String(data.get("currentPassword"));
    const newPassword = String(data.get("newPassword"));

    if (newPassword.length < 8) {
      setFieldError(
        "Le nouveau mot de passe doit faire au moins 8 caractères.",
      );
      return;
    }

    setFieldError(null);
    setErrorMessage(null);
    setState("loading");

    try {
      await auth.changePassword({ currentPassword, newPassword });
      setState("success");
      formRef.current?.reset();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMessage("Mot de passe actuel incorrect.");
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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
      {state === "success" && (
        <p
          role="status"
          className="rounded-lg border border-success/40 bg-success/5 px-3 py-2.5 text-sm text-success"
        >
          Mot de passe modifié.
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {errorMessage}
        </p>
      )}

      <Field
        label="Mot de passe actuel"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />

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

      <Button type="submit" disabled={state === "loading"} className="w-full">
        {state === "loading" ? "Modification…" : "Changer le mot de passe"}
      </Button>
    </form>
  );
}
