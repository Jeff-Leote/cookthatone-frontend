"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { user, loading, authError, retry } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || authError) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, authError, user, router]);

  if (authError) {
    return (
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <p role="alert" className="text-sm text-danger">
          Impossible de contacter le serveur. Vérifie ta connexion.
        </p>
        <Button type="button" onClick={retry}>
          Réessayer
        </Button>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center"
    >
      <p role="status" className="text-sm text-foreground-secondary">
        Chargement…
      </p>
    </main>
  );
}
