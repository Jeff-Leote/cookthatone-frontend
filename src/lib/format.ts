export function formatLongDate(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export const MEAL_SLOT_LABEL: Record<"MIDI" | "SOIR", string> = {
  MIDI: "Déjeuner",
  SOIR: "Dîner",
};

export const UNIT_LABEL: Record<string, string> = {
  G: "g",
  KG: "kg",
  ML: "ml",
  L: "l",
  PIECE: "pcs",
  CUILLERE_A_SOUPE: "c. à soupe",
  CUILLERE_A_CAFE: "c. à café",
  TASSE: "tasse",
  PINCEE: "pincée",
};

export type ExpiryStatus = {
  label: string;
  tone: "danger" | "warning" | "neutral";
};

/** Reflète la fenêtre "bientôt périmé" du backend (7 jours, voir StockService). */
export function getExpiryStatus(expiresAt: string | null): ExpiryStatus {
  if (!expiresAt) return { label: "—", tone: "neutral" };

  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((expiry.getTime() - today.getTime()) / msPerDay);

  if (daysLeft < 0) return { label: "Périmé", tone: "danger" };
  if (daysLeft === 0) return { label: "Aujourd'hui", tone: "danger" };
  if (daysLeft <= 2) return { label: `${daysLeft} j.`, tone: "danger" };
  if (daysLeft <= 7) return { label: `${daysLeft} j.`, tone: "warning" };
  return {
    label: new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(expiry),
    tone: "neutral",
  };
}
