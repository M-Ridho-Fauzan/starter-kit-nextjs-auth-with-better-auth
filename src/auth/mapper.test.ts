import { describe, it, expect } from "vitest";
import { defineAuthConfig } from "./config/index";
import { mapConfig } from "./mapper";
import { registerAdapter } from "./adapters/index";
import type { CreateAdapter } from "./adapters/types";

const mockAdapter: CreateAdapter = () => ({
  id: "mock-adapter",
});

registerAdapter("prisma", mockAdapter);

function makeConfig(overrides?: Record<string, unknown>) {
  return defineAuthConfig({
    database: {
      adapter: "prisma",
      url: "postgresql://localhost:5432/db",
    },
    ...overrides,
  });
}

describe("mapConfig", () => {
  it("maps database config", () => {
    const config = makeConfig();
    const result = mapConfig(config);
    expect(result.database).toBeDefined();
  });

  it("maps email/password when enabled", () => {
    const config = makeConfig({
      features: { emailPassword: { enabled: true } },
    });
    const result = mapConfig(config);
    expect(result.emailAndPassword?.enabled).toBe(true);
    expect(result.emailAndPassword?.minPasswordLength).toBe(8);
    expect(result.emailAndPassword?.maxPasswordLength).toBe(128);
  });

  it("omits emailAndPassword when disabled", () => {
    const config = makeConfig({
      features: { emailPassword: { enabled: false } },
    });
    const result = mapConfig(config);
    expect(result.emailAndPassword).toBeUndefined();
  });

  it("maps password reset expiry", () => {
    const config = makeConfig({
      features: {
        emailPassword: { enabled: true },
        passwordReset: { expiresIn: "2h" },
      },
    });
    const result = mapConfig(config);
    expect(result.emailAndPassword?.resetPasswordTokenExpiresIn).toBe(7200);
  });

  it("maps OAuth providers", () => {
    const config = makeConfig({
      features: {
        oauth: {
          github: {
            enabled: true,
            clientId: "gh_id",
            clientSecret: "gh_secret",
          },
          google: {
            enabled: true,
            clientId: "gl_id",
            clientSecret: "gl_secret",
          },
        },
      },
    });
    const result = mapConfig(config);
    const gh = result.socialProviders?.github as
      | { clientId: string }
      | undefined;
    const gl = result.socialProviders?.google as
      | { clientId: string }
      | undefined;
    expect(gh).toBeDefined();
    expect(gh?.clientId).toBe("gh_id");
    expect(gl).toBeDefined();
    expect(gl?.clientId).toBe("gl_id");
  });

  it("maps custom OAuth providers", () => {
    const config = makeConfig({
      features: {
        oauth: {
          custom: [
            { id: "microsoft", clientId: "ms_id", clientSecret: "ms_secret" },
          ],
        },
      },
    });
    const result = mapConfig(config);
    const sp = result.socialProviders as Record<string, { clientId: string }>;
    expect(sp.microsoft).toBeDefined();
    expect(sp.microsoft!.clientId).toBe("ms_id");
  });

  it("maps session config with duration parsing", () => {
    const config = makeConfig({
      session: {
        expiresIn: "24h",
        updateAge: "30m",
        cookieCache: true,
        strategy: "jwt",
        cookieName: "my_session",
      },
    });
    const result = mapConfig(config);
    expect(result.session?.expiresIn).toBe(86400);
    expect(result.session?.updateAge).toBe(1800);
    expect(result.session?.cookieCache).toEqual({ enabled: true });
  });

  it("maps advanced cookies for custom cookie name", () => {
    const config = makeConfig({
      session: {
        cookieName: "custom_session",
        expiresIn: "7d",
        strategy: "jwt",
      },
    });
    const result = mapConfig(config);
    expect(result.advanced?.cookies?.session_token?.name).toBe(
      "custom_session",
    );
  });

  it("includes twoFactor plugin when enabled", () => {
    const config = makeConfig({
      features: { twoFactor: { enabled: true, methods: ["totp"] } },
    });
    const result = mapConfig(config);
    expect(result.plugins).toBeDefined();
    expect(result.plugins).toHaveLength(2);
  });

  it("omits twoFactor plugin when disabled", () => {
    const config = makeConfig({
      features: { twoFactor: { enabled: false } },
    });
    const result = mapConfig(config);
    expect(result.plugins).toBeDefined();
    expect(result.plugins).toHaveLength(1);
  });

  it("maps roles to additionalFields when enabled", () => {
    const config = makeConfig({
      features: {
        roles: {
          enabled: true,
          defaultRole: "member",
          roles: ["user", "admin", "member"],
        },
      },
    });
    const result = mapConfig(config);
    const rf = result.user?.additionalFields?.role as
      | { type: string[]; defaultValue: string; input: boolean }
      | undefined;
    expect(rf).toBeDefined();
    expect(rf?.type).toEqual(["user", "admin", "member"]);
    expect(rf?.defaultValue).toBe("member");
    expect(rf?.input).toBe(false);
  });

  it("omits roles when disabled", () => {
    const config = makeConfig();
    const result = mapConfig(config);
    expect(result.user?.additionalFields).toBeUndefined();
  });

  it("parses various duration formats", () => {
    const config = makeConfig({
      session: {
        expiresIn: "30s",
        strategy: "jwt",
        cookieName: "s",
      },
    });
    const result = mapConfig(config);
    expect(result.session?.expiresIn).toBe(30);
  });

  it("throws on invalid duration format", () => {
    expect(() => {
      const config = makeConfig({
        session: {
          expiresIn: "invalid",
          strategy: "jwt",
          cookieName: "x",
        },
      });
      mapConfig(config);
    }).toThrow();
  });

  it("omits emailVerification when not required and no callback", () => {
    const config = makeConfig({
      features: { emailPassword: { enabled: true } },
    });
    const result = mapConfig(config);
    expect(result.emailVerification).toBeUndefined();
  });

  it("maps emailVerification when requireEmailVerification is true", () => {
    const config = makeConfig({
      features: { emailPassword: { enabled: true, requireEmailVerification: true } },
    });
    const result = mapConfig(config);
    expect(result.emailVerification).toBeDefined();
    expect(result.emailVerification?.sendOnSignUp).toBe(true);
    expect(result.emailVerification?.sendVerificationEmail).toBeTypeOf("function");
  });

  it("maps sendPasswordResetEmail when passwordReset is enabled and callback is provided", () => {
    const config = defineAuthConfig({
      email: {
        sendPasswordResetEmail: async () => {},
      },
      database: { adapter: "prisma" as const, url: "postgresql://localhost/db" },
      features: { emailPassword: { enabled: true }, passwordReset: true },
    });
    const result = mapConfig(config);
    expect(result.emailAndPassword?.sendResetPassword).toBeTypeOf("function");
  });

  it("uses fallback when passwordReset is enabled but no callback provided", () => {
    const config = makeConfig({
      features: { emailPassword: { enabled: true }, passwordReset: true },
    });
    const result = mapConfig(config);
    expect(result.emailAndPassword?.sendResetPassword).toBeTypeOf("function");
  });

  it("omits sendResetPassword when passwordReset is disabled", () => {
    const config = makeConfig({
      features: { emailPassword: { enabled: true }, passwordReset: false },
    });
    const result = mapConfig(config);
    expect(result.emailAndPassword?.sendResetPassword).toBeUndefined();
  });

  it("maps emailVerification when callback is provided without requireEmailVerification", () => {
    const config = defineAuthConfig({
      email: {
        sendVerificationEmail: async () => {},
      },
      database: { adapter: "prisma" as const, url: "postgresql://localhost/db" },
      features: { emailPassword: { enabled: true } },
    });
    const result = mapConfig(config);
    expect(result.emailVerification).toBeDefined();
    expect(result.emailVerification?.sendVerificationEmail).toBeTypeOf("function");
  });
});
