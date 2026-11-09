import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "../ResetPasswordForm";
import { ApiError } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const { mockResetPassword } = vi.hoisted(() => ({
  mockResetPassword: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...original,
    auth: {
      ...original.auth,
      resetPassword: mockResetPassword,
    },
  };
});

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    mockResetPassword.mockReset();
  });

  it("affiche le champ mot de passe et le bouton", () => {
    render(<ResetPasswordForm token="tok-abc" />);
    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /réinitialiser/i }),
    ).toBeInTheDocument();
  });

  it("affiche une erreur sur le champ si le mot de passe est trop court", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token="tok-abc" />);
    await user.type(screen.getByLabelText(/nouveau mot de passe/i), "court");
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /au moins 8 caractères/i,
    );
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("affiche le message de succès après réinitialisation", async () => {
    mockResetPassword.mockResolvedValueOnce({ message: "ok" });
    const user = userEvent.setup();
    render(<ResetPasswordForm token="tok-abc" />);
    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      "motdepasse123",
    );
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));
    expect(
      await screen.findByText(/mot de passe réinitialisé/i),
    ).toBeInTheDocument();
  });

  it("affiche l'erreur 401 avec le message dédié", async () => {
    mockResetPassword.mockRejectedValueOnce(new ApiError(401, "Unauthorized"));
    const user = userEvent.setup();
    render(<ResetPasswordForm token="tok-expire" />);
    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      "motdepasse123",
    );
    await user.click(screen.getByRole("button", { name: /réinitialiser/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /ce lien est invalide ou a déjà été utilisé/i,
    );
  });
});
