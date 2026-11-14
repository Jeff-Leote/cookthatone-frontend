import Link from "next/link";
import { Clock, Utensils, Users } from "lucide-react";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime =
    (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0) || null;

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 hover:border-border-strong"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Utensils size={18} aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-medium">{recipe.title}</h3>
        {recipe.description && (
          <p className="mt-1 line-clamp-2 text-sm text-foreground-secondary">
            {recipe.description}
          </p>
        )}
      </div>
      <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-foreground-secondary">
        <span className="flex items-center gap-1">
          <Clock size={12} aria-hidden="true" />
          {totalTime !== null ? `${totalTime} min` : "—"}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} aria-hidden="true" />
          {recipe.servings} pers.
        </span>
      </div>
    </Link>
  );
}
