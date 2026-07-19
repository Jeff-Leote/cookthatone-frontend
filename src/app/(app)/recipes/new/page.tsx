import type { Metadata } from "next";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export const metadata: Metadata = { title: "Nouvelle recette" };

export default function NewRecipePage() {
  return <RecipeForm />;
}
