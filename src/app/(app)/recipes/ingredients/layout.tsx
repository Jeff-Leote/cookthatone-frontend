import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ingrédients" };

export default function IngredientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
