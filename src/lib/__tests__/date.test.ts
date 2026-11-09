import { describe, it, expect } from "vitest";
import {
  toIsoDate,
  getWeekStart,
  parseIsoDate,
  monthOverlapsRange,
  addDays,
  getWeekDays,
} from "../date";

describe("toIsoDate", () => {
  it("formate en YYYY-MM-DD sans décalage UTC", () => {
    expect(toIsoDate(new Date(2026, 10, 9))).toBe("2026-11-09");
  });

  it("padde le mois et le jour sur deux chiffres", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("getWeekStart", () => {
  it("renvoie le lundi pour un mercredi", () => {
    expect(toIsoDate(getWeekStart(new Date(2026, 10, 11)))).toBe("2026-11-09");
  });

  it("renvoie le lundi précédent pour un dimanche", () => {
    expect(toIsoDate(getWeekStart(new Date(2026, 10, 15)))).toBe("2026-11-09");
  });

  it("renvoie le jour lui-même s'il est lundi", () => {
    expect(toIsoDate(getWeekStart(new Date(2026, 10, 9)))).toBe("2026-11-09");
  });
});

describe("addDays", () => {
  it("ajoute des jours correctement", () => {
    expect(toIsoDate(addDays(new Date(2026, 10, 9), 6))).toBe("2026-11-15");
  });

  it("passe le mois sans erreur", () => {
    expect(toIsoDate(addDays(new Date(2026, 10, 30), 1))).toBe("2026-12-01");
  });
});

describe("parseIsoDate", () => {
  it("retourne la date locale sans décalage de fuseau", () => {
    const d = parseIsoDate("2026-11-09");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(9);
  });

  it("ignore la partie heure d'une chaîne ISO complète", () => {
    const d = parseIsoDate("2026-11-09T00:00:00.000Z");
    expect(d.getDate()).toBe(9);
  });
});

describe("getWeekDays", () => {
  it("renvoie 7 jours à partir du lundi", () => {
    const days = getWeekDays(new Date(2026, 10, 9));
    expect(days).toHaveLength(7);
    expect(days[0].iso).toBe("2026-11-09");
    expect(days[6].iso).toBe("2026-11-15");
  });

  it("marque le bon jour comme aujourd'hui", () => {
    const today = new Date();
    const start = getWeekStart(today);
    const days = getWeekDays(start);
    const marked = days.filter((d) => d.isToday);
    expect(marked).toHaveLength(1);
    expect(marked[0].iso).toBe(toIsoDate(today));
  });
});

describe("monthOverlapsRange", () => {
  it("détecte le chevauchement quand la période couvre le mois", () => {
    expect(
      monthOverlapsRange(new Date(2026, 10, 1), "2026-11-01", "2026-11-30"),
    ).toBe(true);
  });

  it("renvoie false si la période est entièrement avant le mois", () => {
    expect(
      monthOverlapsRange(new Date(2026, 10, 1), "2026-10-01", "2026-10-31"),
    ).toBe(false);
  });

  it("renvoie false si la période est entièrement après le mois", () => {
    expect(
      monthOverlapsRange(new Date(2026, 10, 1), "2026-12-01", "2026-12-31"),
    ).toBe(false);
  });

  it("détecte un chevauchement partiel en fin de mois", () => {
    expect(
      monthOverlapsRange(new Date(2026, 10, 1), "2026-10-25", "2026-11-07"),
    ).toBe(true);
  });

  it("tolère une date ISO avec heure", () => {
    expect(
      monthOverlapsRange(
        new Date(2026, 10, 1),
        "2026-11-01T00:00:00.000Z",
        "2026-11-07T00:00:00.000Z",
      ),
    ).toBe(true);
  });
});
