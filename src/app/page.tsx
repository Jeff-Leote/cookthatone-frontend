"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

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
