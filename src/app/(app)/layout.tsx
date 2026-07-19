"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, authError, retry } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authError && !user) router.replace("/login");
  }, [loading, authError, user, router]);

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p role="alert" className="text-sm text-danger">
          Impossible de contacter le serveur. Vérifie ta connexion.
        </p>
        <Button type="button" onClick={retry}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-foreground-secondary" role="status">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        id="main-content"
        className="flex-1 px-4 py-6 pb-20 md:px-8 md:py-8 md:pb-8"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
