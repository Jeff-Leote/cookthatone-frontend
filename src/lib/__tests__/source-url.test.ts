import { describe, it, expect } from "vitest";
import {
  isSourceUrlError,
  parseSourceUrl,
  sourceUrlForCreate,
  sourceUrlForUpdate,
} from "../source-url";

describe("parseSourceUrl", () => {
  it("accepte https et affiche le domaine", () => {
    expect(parseSourceUrl("https://exemple.fr/recette/tarte")).toEqual({
      safe: true,
      href: "https://exemple.fr/recette/tarte",
      domain: "exemple.fr",
    });
  });

  it("accepte http", () => {
    expect(parseSourceUrl("http://exemple.fr/a")).toMatchObject({
      safe: true,
      domain: "exemple.fr",
    });
  });

  it("retire www. en tête du domaine", () => {
    expect(parseSourceUrl("https://www.exemple.fr/a")).toMatchObject({
      safe: true,
      domain: "exemple.fr",
    });
  });

  it("reste cliquable pour une adresse normale avec port, requête et ancre", () => {
    expect(parseSourceUrl("https://exemple.fr:8443/a?b=1#c")).toMatchObject({
      safe: true,
      domain: "exemple.fr",
    });
  });

  it("ignore les espaces de début et de fin", () => {
    expect(parseSourceUrl("  https://exemple.fr/a  ")).toMatchObject({
      safe: true,
      href: "https://exemple.fr/a",
    });
  });

  it.each([
    ["javascript:alert(1)"],
    ["data:text/html,x"],
    ["ftp://exemple.fr"],
    ["exemple.fr/recette"],
    ["http://"],
    ["https://%%%"],
    ["pas une adresse"],
    [""],
    ["JAVASCRIPT:alert(1)"],
    ["jav\tascript:alert(1)"],
    ["//exemple.fr/a"],
    ["http://fiable.fr@evil.com"],
    ["https://user:pass@exemple.fr/a"],
    ["https://user@exemple.fr/a"],
  ])("refuse %j : texte non cliquable", (raw) => {
    expect(parseSourceUrl(raw)).toEqual({ safe: false, text: raw.trim() });
  });
});

describe("sourceUrlForCreate", () => {
  it("omet le champ s'il est vide ou en espaces", () => {
    expect(sourceUrlForCreate("")).toEqual({});
    expect(sourceUrlForCreate("   ")).toEqual({});
    expect("sourceUrl" in sourceUrlForCreate("")).toBe(false);
  });

  it("envoie la chaîne rognée", () => {
    expect(sourceUrlForCreate("  https://exemple.fr/a ")).toEqual({
      sourceUrl: "https://exemple.fr/a",
    });
  });
});

describe("sourceUrlForUpdate", () => {
  it("envoie null quand le champ est vidé et qu'une source existait", () => {
    expect(sourceUrlForUpdate("", "https://exemple.fr/a")).toEqual({
      sourceUrl: null,
    });
    expect(sourceUrlForUpdate("   ", "https://exemple.fr/a")).toEqual({
      sourceUrl: null,
    });
  });

  it("n'envoie rien si la valeur n'a pas changé", () => {
    expect(
      sourceUrlForUpdate("https://exemple.fr/a", "https://exemple.fr/a"),
    ).toEqual({});
    expect(
      sourceUrlForUpdate(" https://exemple.fr/a ", "https://exemple.fr/a"),
    ).toEqual({});
    expect(sourceUrlForUpdate("", null)).toEqual({});
  });

  it("envoie la chaîne rognée quand elle change", () => {
    expect(
      sourceUrlForUpdate(" https://autre.fr ", "https://exemple.fr"),
    ).toEqual({ sourceUrl: "https://autre.fr" });
    expect(sourceUrlForUpdate("https://autre.fr", null)).toEqual({
      sourceUrl: "https://autre.fr",
    });
  });
});

describe("isSourceUrlError", () => {
  const message =
    "L'adresse de la source doit être une URL http ou https valide, sans identifiants (2048 caractères au plus)";

  it("reconnaît le refus 400 de l'API", () => {
    expect(isSourceUrlError(400, message)).toBe(true);
  });

  it("ignore les autres erreurs", () => {
    expect(isSourceUrlError(400, "Le titre est obligatoire")).toBe(false);
    expect(isSourceUrlError(500, message)).toBe(false);
  });
});
