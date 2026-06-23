// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

let sessionData: {
  data: { user: Record<string, unknown> } | null;
  error: null;
  isPending: boolean;
};

vi.mock("@/auth/auth-client", () => ({
  authClient: {
    useSession: {},
  },
}));

vi.mock("@nanostores/react", () => ({
  useStore: () => sessionData,
}));

const { useHasRole } = await import("./use-has-role");

describe("useHasRole", () => {
  beforeEach(() => {
    sessionData = { data: null, error: null, isPending: false };
  });

  it("returns false when not logged in", () => {
    const { result } = renderHook(() => useHasRole("admin"));
    expect(result.current).toBe(false);
  });

  it("returns true when session has the required role", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com", role: "admin" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useHasRole("admin"));
    expect(result.current).toBe(true);
  });

  it("returns true when session has one of the accepted roles", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com", role: "editor" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useHasRole(["admin", "editor"]));
    expect(result.current).toBe(true);
  });

  it("returns false when session does not have the required role", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com", role: "user" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useHasRole("admin"));
    expect(result.current).toBe(false);
  });

  it("returns false when session does not match any accepted roles", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com", role: "viewer" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useHasRole(["admin", "editor"]));
    expect(result.current).toBe(false);
  });

  it("returns false when user has no role field", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useHasRole("admin"));
    expect(result.current).toBe(false);
  });
});
