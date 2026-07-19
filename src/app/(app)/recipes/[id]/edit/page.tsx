"use client";

import { useParams } from "next/navigation";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  return <RecipeForm recipeId={params.id} />;
}
