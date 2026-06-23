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

const { useRole } = await import("./use-role");

describe("useRole", () => {
  beforeEach(() => {
    sessionData = { data: null, error: null, isPending: false };
  });

  it("returns undefined when not logged in", () => {
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeUndefined();
  });

  it("returns the user's role when logged in", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com", role: "admin" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useRole());
    expect(result.current).toBe("admin");
  });

  it("returns undefined when user has no role field", () => {
    sessionData = {
      data: { user: { id: "1", email: "a@b.com" } },
      error: null,
      isPending: false,
    };

    const { result } = renderHook(() => useRole());
    expect(result.current).toBeUndefined();
  });
});
