export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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
