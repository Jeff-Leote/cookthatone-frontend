import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangePasswordForm } from "../ChangePasswordForm";
import { ApiError } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const { mockChangePassword } = vi.hoisted(() => ({
  mockChangePassword: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...original,
    auth: {
      ...original.auth,
      changePassword: mockChangePassword,
    },
  };
});

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    mockChangePassword.mockReset();
  });

  it("affiche les deux champs mot de passe et le bouton", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByLabelText(/mot de passe actuel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /changer le mot de passe/i }),
    ).toBeInTheDocument();
  });

  it("affiche une erreur sur le champ si le nouveau mot de passe est trop court", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await user.type(screen.getByLabelText(/mot de passe actuel/i), "ancien123");
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), "court");
    await user.click(
      screen.getByRole("button", { name: /changer le mot de passe/i }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /au moins 8 caractères/i,
    );
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it("affiche le message de succès et remet le formulaire à zéro", async () => {
    mockChangePassword.mockResolvedValueOnce({ message: "ok" });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    const currentField = screen.getByLabelText(/mot de passe actuel/i);
    const newField = screen.getByLabelText(/nouveau mot de passe/i);
    await user.type(currentField, "ancien123");
    await user.type(newField, "nouveau456");
    await user.click(
      screen.getByRole("button", { name: /changer le mot de passe/i }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      /mot de passe modifié/i,
    );
    expect((currentField as HTMLInputElement).value).toBe("");
    expect((newField as HTMLInputElement).value).toBe("");
  });

  it("affiche l'erreur 401 avec le message dédié", async () => {
    mockChangePassword.mockRejectedValueOnce(new ApiError(401, "Unauthorized"));
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await user.type(screen.getByLabelText(/mot de passe actuel/i), "mauvais");
    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      "nouveau456",
    );
    await user.click(
      screen.getByRole("button", { name: /changer le mot de passe/i }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /mot de passe actuel incorrect/i,
    );
  });
});
