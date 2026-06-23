// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignOut = vi.fn();
vi.mock("@/auth/auth-client", () => ({
  authClient: { signOut: (...args: unknown[]) => mockSignOut(...args) },
}));

const mockUseStore = vi.fn();
vi.mock("@nanostores/react", () => ({
  useStore: (...args: unknown[]) => mockUseStore(...args),
}));

vi.mock("../../../auth.config", () => ({
  default: {
    ui: {
      redirectAfterLogin: "/dashboard",
      redirectAfterLogout: "/login",
      twoFactorSettingsPath: "/settings/2fa",
    },
  },
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

vi.mock("@/auth/auth-client", () => ({
  authClient: { signOut: (...args: unknown[]) => mockSignOut(...args) },
}));

const { UserProfile } = await import("./user-profile");

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders user name and email", () => {
    mockUseStore.mockReturnValue({
      data: {
        user: { id: "1", name: "Alice", email: "alice@test.com" },
        session: { id: "s1", expiresAt: new Date() },
      },
      isPending: false,
    });

    render(<UserProfile />);

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("alice@test.com")).toBeDefined();
  });

  it("renders role badge when user has a role", () => {
    mockUseStore.mockReturnValue({
      data: {
        user: { id: "1", name: "Alice", email: "a@b.com", role: "admin" },
        session: { id: "s1", expiresAt: new Date() },
      },
      isPending: false,
    });

    render(<UserProfile />);

    expect(screen.getByText("admin")).toBeDefined();
  });

  it("returns null when not authenticated", () => {
    mockUseStore.mockReturnValue({
      data: null,
      isPending: false,
    });

    const { container } = render(<UserProfile />);

    expect(container.innerHTML).toBe("");
  });

  it("navigates to 2FA settings on button click", async () => {
    mockUseStore.mockReturnValue({
      data: {
        user: { id: "1", name: "Alice", email: "a@b.com" },
        session: { id: "s1", expiresAt: new Date() },
      },
      isPending: false,
    });

    render(<UserProfile />);

    await userEvent.click(screen.getByText("Two-factor settings"));
    expect(mockPush).toHaveBeenCalledWith("/settings/2fa");
  });

  it("calls signOut on sign out button click", async () => {
    mockUseStore.mockReturnValue({
      data: {
        user: { id: "1", name: "Alice", email: "a@b.com" },
        session: { id: "s1", expiresAt: new Date() },
      },
      isPending: false,
    });

    render(<UserProfile />);

    await userEvent.click(screen.getByText("Sign out"));
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
