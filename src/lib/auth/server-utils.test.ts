import { describe, it, expect, vi, beforeEach } from "vitest";
import { getServerSession, hasRole } from "./server-utils";
import type { Session } from "@/auth/server";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({ cookie: "mock-cookie" }))),
}));

const { mockGetSession } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
}));

vi.mock("@/auth/server", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

function makeSession(role?: string): Session | null {
  const base = {
    session: {
      id: "sess1",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "user1",
      expiresAt: new Date(),
      token: "tok1",
    },
    user: {
      id: "user1",
      email: "a@b.com",
      emailVerified: true,
      name: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  } as Session;

  if (role) {
    (base.user as Record<string, unknown>).role = role;
  }

  return role !== undefined ? base : null;
}

describe("getServerSession", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  it("returns the session when authenticated", async () => {
    const session = makeSession("admin");
    mockGetSession.mockResolvedValue(session);

    const result = await getServerSession();

    expect(result).toBe(session);
    expect(mockGetSession).toHaveBeenCalledOnce();
    expect(mockGetSession).toHaveBeenCalledWith(
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it("returns null when not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const result = await getServerSession();

    expect(result).toBeNull();
  });

  it("returns null when getSession throws", async () => {
    mockGetSession.mockRejectedValue(new Error("Network error"));

    const result = await getServerSession();

    expect(result).toBeNull();
  });

  it("returns a session with role field", async () => {
    const session = makeSession("admin");
    mockGetSession.mockResolvedValue(session);

    const result = await getServerSession();

    expect(result).not.toBeNull();
    expect((result!.user as Record<string, unknown>).role).toBe("admin");
  });
});

describe("hasRole", () => {
  it("returns true when user has the required role", () => {
    const session = makeSession("admin");
    expect(hasRole(session, "admin")).toBe(true);
  });

  it("returns true when user matches one of the accepted roles", () => {
    const session = makeSession("editor");
    expect(hasRole(session, ["admin", "editor"])).toBe(true);
  });

  it("returns false when user has a different role", () => {
    const session = makeSession("user");
    expect(hasRole(session, "admin")).toBe(false);
  });

  it("returns false when user does not match any accepted roles", () => {
    const session = makeSession("viewer");
    expect(hasRole(session, ["admin", "editor"])).toBe(false);
  });

  it("returns false for null session", () => {
    expect(hasRole(null, "admin")).toBe(false);
  });

  it("returns false for undefined session", () => {
    expect(hasRole(undefined, "admin")).toBe(false);
  });

  it("returns false when session has no user", () => {
    const session = { ...makeSession("admin"), user: null } as unknown as Session;
    expect(hasRole(session, "admin")).toBe(false);
  });

  it("returns false when user has no role field", () => {
    const session = makeSession();
    expect(hasRole(session, "admin")).toBe(false);
  });
});
