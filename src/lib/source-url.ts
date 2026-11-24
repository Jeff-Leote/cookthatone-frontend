/**
 * Adresse source d'une recette (`sourceUrl`).
 * L'API valide déjà l'adresse ; ces fonctions revérifient le schéma côté
 * client avant d'en faire un lien, et préparent la charge utile des
 * formulaires (omission, rognage, effacement).
 */

/** Phrase par laquelle l'API signale une adresse de source refusée (400). */
export const SOURCE_URL_ERROR_MARKER = "L'adresse de la source";

export const SOURCE_URL_ERROR_MESSAGE =
  "L'adresse de la source doit être une URL http ou https valide, sans identifiants (2048 caractères au plus).";

export type SourceLink =
  { safe: true; href: string; domain: string } | { safe: false; text: string };

/**
 * Décide si l'adresse peut devenir un lien : seulement `http:` ou `https:`.
 * Toute autre valeur (autre schéma, absence de schéma, identifiants dans
 * l'adresse, chaîne illisible)
 * donne `safe: false` et le texte à afficher tel quel, sans lien.
 */
export function parseSourceUrl(raw: string): SourceLink {
  const text = raw.trim();
  try {
    const url = new URL(text);
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== "" &&
      url.username === "" &&
      url.password === ""
    ) {
      return {
        safe: true,
        href: url.href,
        domain: url.hostname.replace(/^www\./, ""),
      };
    }
  } catch {
    // adresse illisible : on retombe sur le texte brut
  }
  return { safe: false, text };
}

/** Charge utile de création : le champ est omis s'il est vide (l'API refuse `null`). */
export function sourceUrlForCreate(input: string): { sourceUrl?: string } {
  const value = input.trim();
  return value ? { sourceUrl: value } : {};
}

/**
 * Charge utile de modification : rien si la valeur n'a pas changé,
 * `null` pour effacer une source existante, la chaîne rognée sinon.
 */
export function sourceUrlForUpdate(
  input: string,
  original: string | null,
): { sourceUrl?: string | null } {
  const value = input.trim();
  if (value === (original ?? "")) return {};
  return { sourceUrl: value === "" ? null : value };
}

/** Vrai si l'erreur 400 de l'API concerne l'adresse de la source. */
export function isSourceUrlError(status: number, message: string): boolean {
  return status === 400 && message.includes(SOURCE_URL_ERROR_MARKER);
}
