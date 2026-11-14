import type { Metadata } from "next";

export const metadata: Metadata = { title: "Modifier la recette" };

export default function EditRecipeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
