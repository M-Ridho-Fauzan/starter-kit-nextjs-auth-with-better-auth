import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetSession = vi.fn();

vi.mock("@/auth/server", () => ({
  auth: { api: { getSession: mockGetSession } },
}));

vi.mock("../auth.config", () => ({
  default: {
    ui: {
      redirectAfterLogin: "/dashboard",
      redirectAfterLogout: "/login",
      protectedPaths: ["/dashboard", "/settings", "/admin"],
      roleRestrictions: { "/admin": ["admin"] },
    },
  },
}));

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}

async function callMiddleware(url: string): Promise<{
  status: number;
  location: string | null;
}> {
  const { proxy } = await import("./proxy");
  const request = new NextRequest(new Request(url));
  const response = await proxy(request);
  return {
    status: response.status,
    location: response.headers.get("location"),
  };
}

describe("proxy", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
  });

  describe("unauthenticated access", () => {
    it("redirects to login for protected routes", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await callMiddleware("http://localhost:3000/dashboard");

      expect(isRedirect(result.status)).toBe(true);
      expect(result.location).toContain("/login");
    });

    it("redirects to login for role-restricted routes", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await callMiddleware("http://localhost:3000/admin");

      expect(isRedirect(result.status)).toBe(true);
      expect(result.location).toContain("/login");
    });

    it("passes through for public routes", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await callMiddleware("http://localhost:3000/login");

      expect(isRedirect(result.status)).toBe(false);
    });

    it("passes through for public routes like register", async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await callMiddleware("http://localhost:3000/register");

      expect(isRedirect(result.status)).toBe(false);
    });
  });

  describe("authenticated access", () => {
    it("passes through for protected routes", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1", role: "user" },
        session: { id: "s1" },
      });

      const result = await callMiddleware("http://localhost:3000/dashboard");

      expect(isRedirect(result.status)).toBe(false);
    });
  });

  describe("role-based access", () => {
    it("allows admin to access /admin routes", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1", role: "admin" },
        session: { id: "s1" },
      });

      const result = await callMiddleware("http://localhost:3000/admin");

      expect(isRedirect(result.status)).toBe(false);
    });

    it("redirects non-admin away from /admin routes", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1", role: "user" },
        session: { id: "s1" },
      });

      const result = await callMiddleware("http://localhost:3000/admin");

      expect(isRedirect(result.status)).toBe(true);
      expect(result.location).toContain("/dashboard");
    });

    it("redirects user with no role away from /admin", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1" },
        session: { id: "s1" },
      });

      const result = await callMiddleware("http://localhost:3000/admin");

      expect(isRedirect(result.status)).toBe(true);
      expect(result.location).toContain("/dashboard");
    });
  });

  describe("error handling", () => {
    it("redirects to login when getSession throws", async () => {
      mockGetSession.mockRejectedValue(new Error("Auth error"));

      const result = await callMiddleware("http://localhost:3000/dashboard");

      expect(isRedirect(result.status)).toBe(true);
      expect(result.location).toContain("/login");
    });
  });
});
