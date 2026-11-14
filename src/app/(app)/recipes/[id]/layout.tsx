import type { Metadata } from "next";

export const metadata: Metadata = { title: "Recette" };

export default function RecipeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
