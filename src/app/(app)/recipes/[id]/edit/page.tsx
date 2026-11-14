"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { RecipeForm } from "@/components/recipes/RecipeForm";

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "Modifier la recette · CookthatOne";
    return () => {
      document.title = "Modifier la recette · CookthatOne";
    };
  }, []);

  return <RecipeForm recipeId={params.id} />;
}
