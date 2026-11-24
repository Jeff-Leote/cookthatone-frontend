import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeForm } from "../RecipeForm";
import { ApiError } from "@/lib/api";
import type { Recipe } from "@/lib/types";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}));

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  get: vi.fn(),
  replaceSteps: vi.fn(),
  listIngredients: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...original,
    recipes: {
      ...original.recipes,
      create: mocks.create,
      update: mocks.update,
      get: mocks.get,
      replaceSteps: mocks.replaceSteps,
    },
    ingredients: { ...original.ingredients, list: mocks.listIngredients },
  };
});

const API_MESSAGE =
  "L'adresse de la source doit être une URL http ou https valide, sans identifiants (2048 caractères au plus)";

function recipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    title: "Tarte aux pommes",
    description: null,
    prepTimeMin: null,
    cookTimeMin: null,
    servings: 4,
    sourceUrl: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    recipeIngredients: [],
    steps: [],
    ...overrides,
  };
}

describe("RecipeForm : adresse de la source", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.listIngredients.mockResolvedValue([]);
    mocks.create.mockResolvedValue(recipe());
    mocks.update.mockResolvedValue(recipe());
    mocks.replaceSteps.mockResolvedValue(undefined);
  });

  it("propose un champ optionnel avec aide, type url et saisie adaptée", async () => {
    render(<RecipeForm />);
    const field = await screen.findByLabelText("Adresse de la source");
    expect(field).toHaveAttribute("type", "url");
    expect(field).toHaveAttribute("inputmode", "url");
    expect(field).toHaveAttribute("autocomplete", "off");
    expect(field).not.toBeRequired();
    expect(field).toHaveAccessibleDescription(
      "Adresse de la page d'origine, commençant par https://",
    );
  });

  it.each([[""], ["   "]])(
    "création : champ %j omis de la requête",
    async (value) => {
      const user = userEvent.setup();
      render(<RecipeForm />);
      await user.type(await screen.findByLabelText(/^Titre/), "Tarte");
      if (value) {
        await user.type(screen.getByLabelText("Adresse de la source"), value);
      }
      await user.click(screen.getByRole("button", { name: "Enregistrer" }));
      await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
      expect(mocks.create.mock.calls[0][0]).not.toHaveProperty("sourceUrl");
    },
  );

  it("création : envoie l'adresse rognée", async () => {
    const user = userEvent.setup();
    render(<RecipeForm />);
    await user.type(await screen.findByLabelText(/^Titre/), "Tarte");
    await user.type(
      screen.getByLabelText("Adresse de la source"),
      "  https://exemple.fr/tarte  ",
    );
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
    expect(mocks.create.mock.calls[0][0]).toMatchObject({
      sourceUrl: "https://exemple.fr/tarte",
    });
  });

  it("modification : préremplit le champ avec la source existante", async () => {
    mocks.get.mockResolvedValue(recipe({ sourceUrl: "https://exemple.fr/a" }));
    render(<RecipeForm recipeId="r1" />);
    expect(await screen.findByLabelText("Adresse de la source")).toHaveValue(
      "https://exemple.fr/a",
    );
  });

  it("modification : champ vidé, envoie null", async () => {
    mocks.get.mockResolvedValue(recipe({ sourceUrl: "https://exemple.fr/a" }));
    const user = userEvent.setup();
    render(<RecipeForm recipeId="r1" />);
    await user.clear(await screen.findByLabelText("Adresse de la source"));
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update.mock.calls[0][1]).toHaveProperty("sourceUrl", null);
  });

  it("modification : champ rempli, envoie la chaîne rognée", async () => {
    mocks.get.mockResolvedValue(recipe({ sourceUrl: "https://exemple.fr/a" }));
    const user = userEvent.setup();
    render(<RecipeForm recipeId="r1" />);
    const field = await screen.findByLabelText("Adresse de la source");
    await user.clear(field);
    await user.type(field, " https://autre.fr/b ");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update.mock.calls[0][1]).toHaveProperty(
      "sourceUrl",
      "https://autre.fr/b",
    );
  });

  it("modification : champ non modifié, n'envoie pas la source", async () => {
    mocks.get.mockResolvedValue(recipe({ sourceUrl: "https://exemple.fr/a" }));
    const user = userEvent.setup();
    render(<RecipeForm recipeId="r1" />);
    await screen.findByLabelText("Adresse de la source");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update.mock.calls[0][1]).not.toHaveProperty("sourceUrl");
  });

  it("affiche le refus 400 de l'API sous le champ", async () => {
    mocks.create.mockRejectedValue(new ApiError(400, API_MESSAGE));
    const user = userEvent.setup();
    render(<RecipeForm />);
    await user.type(await screen.findByLabelText(/^Titre/), "Tarte");
    const field = screen.getByLabelText("Adresse de la source");
    await user.type(field, "ftp://exemple.fr");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/L'adresse de la source doit être/);
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/L'adresse de la source/);
    expect(field).toHaveFocus();
    expect(push).not.toHaveBeenCalled();
  });
});
