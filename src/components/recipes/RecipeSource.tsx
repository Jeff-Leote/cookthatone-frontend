import { ExternalLink } from "lucide-react";
import { parseSourceUrl } from "@/lib/source-url";

/**
 * Source d'une recette. Lien sécurisé si l'adresse est en http(s), sinon
 * texte non cliquable. Le contenu passe toujours par React (jamais en HTML).
 */
export function RecipeSource({ sourceUrl }: { sourceUrl: string | null }) {
  if (!sourceUrl || !sourceUrl.trim()) return null;
  const link = parseSourceUrl(sourceUrl);

  if (!link.safe) {
    return (
      <p className="flex flex-wrap gap-x-1.5 text-sm text-foreground-secondary">
        <span>Source :</span>
        <span className="min-w-0 break-all">{link.text}</span>
      </p>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      className="inline-flex min-h-11 max-w-full items-center gap-1.5 text-sm text-accent underline underline-offset-2 hover:text-foreground"
    >
      <span>Source</span>{" "}
      <span className="min-w-0 break-all text-foreground-secondary">
        {link.domain}
      </span>
      <ExternalLink size={16} aria-hidden="true" className="shrink-0" />{" "}
      <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
    </a>
  );
}
