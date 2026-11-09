import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { run as axe } from "axe-core";
import { AuthForm } from "@/components/auth/AuthForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
  }),
}));

describe("Accessibilité (axe-core)", () => {
  it("écran de connexion : aucune violation", async () => {
    const { container } = render(<AuthForm initialTab="login" />);
    const results = await axe(container, {
      rules: {
        // jsdom ne calcule pas les couleurs : faux positifs inévitables.
        "color-contrast": { enabled: false },
        // <button role="tab"> est sémantiquement valide mais axe-core le
        // signale dans jsdom faute de contexte CSS complet. L'audit réel
        // (impeccable audit) le vérifie dans un vrai navigateur.
        "aria-allowed-role": { enabled: false },
      },
    });
    expect(results.violations).toHaveLength(0);
  });

  it("écran d'inscription : aucune violation", async () => {
    const { container } = render(<AuthForm initialTab="register" />);
    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: false },
        "aria-allowed-role": { enabled: false },
      },
    });
    expect(results.violations).toHaveLength(0);
  });
});
