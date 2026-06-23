// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockUseStore = vi.fn();
vi.mock("@nanostores/react", () => ({
  useStore: (...args: unknown[]) => mockUseStore(...args),
}));

vi.mock("@/auth/auth-client", () => ({
  authClient: { useSession: "session-atom" },
}));

import { useSession } from "./use-session";

describe("useSession", () => {
  beforeEach(() => {
    mockUseStore.mockReset();
  });

  it("returns null when not authenticated", () => {
    mockUseStore.mockReturnValue({ data: null, isPending: false });

    const { result } = renderHook(() => useSession());

    expect(result.current).toBeNull();
  });

  it("returns session data when authenticated", () => {
    const session = {
      user: { id: "1", name: "Test" },
      session: { id: "s1", expiresAt: new Date() },
    };
    mockUseStore.mockReturnValue({ data: session, isPending: false });

    const { result } = renderHook(() => useSession());

    expect(result.current).toEqual(session);
  });

  it("reacts to session changes", () => {
    mockUseStore.mockReturnValue({ data: null, isPending: true });

    const { result, rerender } = renderHook(() => useSession());

    expect(result.current).toBeNull();

    const session = {
      user: { id: "1" },
      session: { id: "s1", expiresAt: new Date() },
    };
    mockUseStore.mockReturnValue({ data: session, isPending: false });
    rerender();

    expect(result.current).toEqual(session);
  });
});
