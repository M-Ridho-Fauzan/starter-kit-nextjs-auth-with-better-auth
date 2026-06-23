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

import { useAuth } from "./use-auth";

describe("useAuth", () => {
  beforeEach(() => {
    mockUseStore.mockReset();
  });

  it("returns loading state initially", () => {
    mockUseStore.mockReturnValue({ data: null, isPending: true });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("returns authenticated state when session exists", () => {
    const session = {
      user: { id: "1", name: "Test", role: "admin" },
      session: { id: "s1", expiresAt: new Date() },
    };
    mockUseStore.mockReturnValue({ data: session, isPending: false });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(session.user);
    expect(result.current.session).toEqual(session.session);
  });

  it("returns unauthenticated state when no session", () => {
    mockUseStore.mockReturnValue({ data: null, isPending: false });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("reacts to session changes", () => {
    const session = {
      user: { id: "1", name: "Test" },
      session: { id: "s1", expiresAt: new Date() },
    };
    mockUseStore.mockReturnValue({ data: null, isPending: true });

    const { result, rerender } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);

    mockUseStore.mockReturnValue({ data: session, isPending: false });
    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(session.user);

    mockUseStore.mockReturnValue({ data: null, isPending: false });
    rerender();

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
