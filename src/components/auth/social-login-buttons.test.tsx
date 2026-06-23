// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignInSocial = vi.fn();

vi.mock("@/auth/auth-client", () => ({
  authClient: {
    signIn: {
      social: mockSignInSocial,
    },
  },
}));

const { SocialLoginButtons } = await import("./social-login-buttons");

describe("SocialLoginButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("returns null when providers is empty", () => {
    const { container } = render(<SocialLoginButtons providers={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders buttons for each provider", () => {
    render(<SocialLoginButtons providers={["github", "google"]} />);

    expect(
      screen.getByRole("button", { name: "Sign in with GitHub" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Sign in with Google" }),
    ).toBeDefined();
  });

  it("calls signIn with provider id on click", async () => {
    const user = userEvent.setup();
    render(<SocialLoginButtons providers={["github"]} />);

    await user.click(screen.getByRole("button"));

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: undefined,
    });
  });

  it("passes redirectTo to signIn", async () => {
    const user = userEvent.setup();
    render(
      <SocialLoginButtons providers={["discord"]} redirectTo="/dashboard" />,
    );

    await user.click(screen.getByRole("button"));

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: "discord",
      callbackURL: "/dashboard",
    });
  });
});
