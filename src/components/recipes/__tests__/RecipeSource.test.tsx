import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecipeSource } from "../RecipeSource";

describe("RecipeSource", () => {
  it("affiche un lien sécurisé avec le domaine et un libellé accessible", () => {
    render(<RecipeSource sourceUrl="https://www.exemple.fr/recette/tarte" />);
    const link = screen.getByRole("link", {
      name: "Source exemple.fr (s'ouvre dans un nouvel onglet)",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.exemple.fr/recette/tarte",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(link).toHaveTextContent("exemple.fr");
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,x",
    "ftp://exemple.fr",
    "exemple.fr/recette",
    "https://%%%",
    "pas une adresse",
    "JAVASCRIPT:alert(1)",
    "//exemple.fr/a",
    "http://fiable.fr@evil.com",
    "https://user:pass@exemple.fr/a",
  ])("affiche %j en texte non cliquable", (value) => {
    const { container } = render(<RecipeSource sourceUrl={value} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector("a")).toBeNull();
    expect(container).toHaveTextContent(value);
  });

  it("n'insère jamais l'adresse comme HTML", () => {
    const { container } = render(
      <RecipeSource sourceUrl={'x"><img src=x onerror=alert(1)>'} />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("<img");
  });

  it("n'affiche rien sans source", () => {
    const { container } = render(<RecipeSource sourceUrl={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
