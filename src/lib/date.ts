const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

/**
 * Formate en YYYY-MM-DD à partir des composants LOCAUX de la date.
 * `date.toISOString()` convertit d'abord en UTC — en heure d'été
 * française (UTC+2), un minuit local peut ainsi glisser sur la veille.
 */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Lundi de la semaine contenant `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export interface WeekDay {
  date: Date;
  iso: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
}

export function getWeekDays(weekStart: Date): WeekDay[] {
  const todayIso = toIsoDate(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const iso = toIsoDate(date);
    return {
      date,
      iso,
      label: DAY_LABELS[i],
      dayNumber: date.getDate(),
      isToday: iso === todayIso,
    };
  });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  });
  return `${fmt.format(weekStart)} — ${fmt.format(weekEnd)} ${weekEnd.getFullYear()}`;
}

export function formatFullDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** 1ᵉʳ du mois contenant `date`, minuit local. */
export function getMonthStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function formatMonthLabel(date: Date): string {
  const formatted = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** "8 — 15 août 2026", ou "28 juil. — 3 août 2026" si les mois diffèrent. */
export function formatDateRange(start: Date, end: Date): string {
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  });
  return `${fmt.format(start)} — ${fmt.format(end)} ${end.getFullYear()}`;
}

/**
 * Premier et dernier jour (inclusif) du mois contenant `date`, en ISO.
 * Sert à savoir si une liste de courses (bornée par ses propres dates ISO)
 * chevauche le mois affiché, par comparaison de chaînes plutôt que d'objets
 * Date (voir toIsoDate : évite les pièges de fuseau horaire).
 */
export function getMonthBoundsIso(date: Date): {
  startIso: string;
  endIso: string;
} {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { startIso: toIsoDate(start), endIso: toIsoDate(end) };
}

/** `periodStartIso`/`periodEndIso` peuvent inclure une heure (ex: réponse API) ; seuls les 10 premiers caractères comptent. */
export function monthOverlapsRange(
  monthDate: Date,
  periodStartIso: string,
  periodEndIso: string,
): boolean {
  const { startIso, endIso } = getMonthBoundsIso(monthDate);
  const start = periodStartIso.slice(0, 10);
  const end = periodEndIso.slice(0, 10);
  return start <= endIso && end >= startIso;
}
