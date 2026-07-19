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
