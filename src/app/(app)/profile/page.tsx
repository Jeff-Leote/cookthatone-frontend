"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium">Mon profil</h1>

      <Card className="max-w-md !p-0">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-lg text-accent"
          >
            👤
          </span>
          <div>
            <p className="font-medium">{user.pseudo}</p>
            <p className="text-sm text-foreground-secondary">{user.email}</p>
          </div>
        </div>

        <dl>
          <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm">
            <dt className="text-foreground-secondary">Pseudo</dt>
            <dd className="font-medium">{user.pseudo}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border px-5 py-3 text-sm">
            <dt className="text-foreground-secondary">Adresse email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-3 text-sm">
            <dt className="text-foreground-secondary">Membre depuis</dt>
            <dd className="font-medium">{memberSince}</dd>
          </div>
        </dl>

        <div className="p-5 pt-0">
          <Button
            type="button"
            variant="danger"
            onClick={logout}
            className="w-full justify-center"
          >
            <span aria-hidden="true">↪</span> Se déconnecter
          </Button>
        </div>
      </Card>
    </div>
  );
}
