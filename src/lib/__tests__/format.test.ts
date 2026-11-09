import { describe, it, expect } from "vitest";
import {
  formatShoppingListTitle,
  getExpiryStatus,
  UNIT_LABEL,
} from "../format";

describe("formatShoppingListTitle", () => {
  it("affiche 'Liste du ...' pour une seule date", () => {
    const title = formatShoppingListTitle("2026-11-09", "2026-11-09");
    expect(title).toMatch(/^Liste du /);
  });

  it("contient 'au' pour une plage de dates", () => {
    const title = formatShoppingListTitle("2026-11-09", "2026-11-15");
    expect(title).toMatch(/au/);
  });
});

describe("UNIT_LABEL", () => {
  it("contient toutes les unités attendues", () => {
    expect(UNIT_LABEL["G"]).toBe("g");
    expect(UNIT_LABEL["KG"]).toBe("kg");
    expect(UNIT_LABEL["ML"]).toBe("ml");
    expect(UNIT_LABEL["CL"]).toBe("cl");
    expect(UNIT_LABEL["L"]).toBe("l");
    expect(UNIT_LABEL["CUILLERE_A_SOUPE"]).toBe("c. à soupe");
    expect(UNIT_LABEL["CUILLERE_A_CAFE"]).toBe("c. à café");
    expect(UNIT_LABEL["PIECE"]).toBe("pcs");
    expect(UNIT_LABEL["PINCEE"]).toBe("pincée");
  });
});

describe("getExpiryStatus", () => {
  it("renvoie '—' et tone neutral si aucune date", () => {
    const s = getExpiryStatus(null);
    expect(s.label).toBe("—");
    expect(s.tone).toBe("neutral");
  });

  it("renvoie 'Périmé' et tone danger pour une date passée", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const s = getExpiryStatus(past.toISOString());
    expect(s.label).toBe("Périmé");
    expect(s.tone).toBe("danger");
  });

  it('renvoie "Aujourd\'hui" et tone danger pour la date du jour', () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const s = getExpiryStatus(today.toISOString());
    expect(s.label).toBe("Aujourd'hui");
    expect(s.tone).toBe("danger");
  });

  it("renvoie tone danger pour 1 jour restant", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 1);
    const s = getExpiryStatus(soon.toISOString());
    expect(s.tone).toBe("danger");
  });

  it("renvoie tone warning pour 5 jours restants", () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const s = getExpiryStatus(future.toISOString());
    expect(s.tone).toBe("warning");
  });

  it("renvoie tone neutral pour plus de 7 jours restants", () => {
    const distant = new Date();
    distant.setDate(distant.getDate() + 10);
    const s = getExpiryStatus(distant.toISOString());
    expect(s.tone).toBe("neutral");
  });
});
