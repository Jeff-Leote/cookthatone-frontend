import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recettes" };

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
