import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "../ForgotPasswordForm";
import { ApiError } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const { mockForgotPassword } = vi.hoisted(() => ({
  mockForgotPassword: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...original,
    auth: {
      ...original.auth,
      forgotPassword: mockForgotPassword,
    },
  };
});

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    mockForgotPassword.mockReset();
  });

  it("affiche le champ email et le bouton d'envoi", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /envoyer le lien/i }),
    ).toBeInTheDocument();
  });

  it("affiche le message générique en cas de succès", async () => {
    mockForgotPassword.mockResolvedValueOnce({ message: "ok" });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText(/adresse email/i), "test@test.fr");
    await user.click(screen.getByRole("button", { name: /envoyer le lien/i }));
    expect(
      await screen.findByText(/si cette adresse est associée à un compte/i),
    ).toBeInTheDocument();
  });

  it("affiche un message d'erreur en cas d'erreur réseau", async () => {
    mockForgotPassword.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText(/adresse email/i), "test@test.fr");
    await user.click(screen.getByRole("button", { name: /envoyer le lien/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /une erreur est survenue/i,
    );
  });
});

// Référence nécessaire uniquement pour satisfaire le typage de l'import.
void ApiError;
