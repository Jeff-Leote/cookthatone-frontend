import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "../AuthForm";
import { ApiError } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ login: mockLogin, register: mockRegister }),
}));

describe("AuthForm — connexion", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("affiche les champs email, mot de passe et le bouton", () => {
    render(<AuthForm initialTab="login" />);
    expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /se connecter/i }),
    ).toBeInTheDocument();
  });

  it("désactive le bouton pendant la soumission", async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<AuthForm initialTab="login" />);
    await user.type(screen.getByLabelText(/adresse email/i), "test@test.fr");
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));
    expect(screen.getByRole("button", { name: /connexion…/i })).toBeDisabled();
  });

  it("affiche l'erreur retournée par l'API", async () => {
    mockLogin.mockRejectedValue(new ApiError(401, "Identifiants invalides"));
    const user = userEvent.setup();
    render(<AuthForm initialTab="login" />);
    await user.type(screen.getByLabelText(/adresse email/i), "test@test.fr");
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Identifiants invalides",
    );
  });
});

describe("AuthForm — inscription", () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it("affiche une erreur si le pseudo est invalide", async () => {
    const user = userEvent.setup();
    render(<AuthForm initialTab="register" />);
    await user.type(screen.getByLabelText(/adresse email/i), "test@test.fr");
    await user.type(screen.getByLabelText(/^pseudo/i), "ab");
    await user.type(screen.getAllByLabelText(/mot de passe/i)[0], "motdepasse");
    await user.type(screen.getByLabelText(/confirmer/i), "motdepasse");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/3 à 20 caractères/i);
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    const user = userEvent.setup();
    render(<AuthForm initialTab="register" />);
    await user.type(screen.getByLabelText(/adresse email/i), "test@test.fr");
    await user.type(screen.getByLabelText(/^pseudo/i), "sophie_cuisine");
    await user.type(screen.getAllByLabelText(/mot de passe/i)[0], "motdepasse");
    await user.type(screen.getByLabelText(/confirmer/i), "different");
    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      /ne correspondent pas/i,
    );
  });
});
