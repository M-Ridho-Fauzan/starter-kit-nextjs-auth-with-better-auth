import { describe, it, expect } from "vitest";
import { defineAuthConfig } from "./index";
import type { AuthConfigInput } from "./types";

const minimalConfig = {
  database: {
    adapter: "prisma" as const,
    url: "postgresql://localhost:5432/db",
  },
} satisfies AuthConfigInput;

describe("defineAuthConfig", () => {
  it("returns config with defaults for omitted sections", () => {
    const config = defineAuthConfig(minimalConfig);

    expect(config.database.adapter).toBe("prisma");
    expect(config.database.url).toBe("postgresql://localhost:5432/db");

    expect(config.session.expiresIn).toBe("7d");
    expect(config.session.strategy).toBe("jwt");
    expect(config.session.cookieName).toBe("auth_session");
    expect(config.session.cookieCache).toBe(false);

    expect(config.ui.theme).toBe("shadcn");
    expect(config.ui.redirectAfterLogin).toBe("/dashboard");
    expect(config.ui.redirectAfterLogout).toBe("/");
  });

  it("defaults emailPassword to disabled", () => {
    const config = defineAuthConfig(minimalConfig);
    expect(config.features.emailPassword.enabled).toBe(false);
    expect(config.features.emailPassword.passwordMinLength).toBe(8);
  });

  it("defaults passwordReset to false", () => {
    const config = defineAuthConfig(minimalConfig);
    expect(config.features.passwordReset).toBe(false);
  });

  it("accepts passwordReset as object", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: { passwordReset: { expiresIn: "2h" } },
    });
    expect(config.features.passwordReset).toEqual({ expiresIn: "2h" });
  });

  it("defaults twoFactor and roles to disabled", () => {
    const config = defineAuthConfig(minimalConfig);
    expect(config.features.twoFactor.enabled).toBe(false);
    expect(config.features.roles.enabled).toBe(false);
    expect(config.features.roles.defaultRole).toBe("user");
    expect(config.features.roles.roles).toEqual(["user", "admin"]);
  });

  it("throws on invalid duration string", () => {
    expect(() =>
      defineAuthConfig({
        ...minimalConfig,
        session: { expiresIn: "7years" },
      }),
    ).toThrow();
  });

  it("throws on unknown session strategy", () => {
    expect(() =>
      defineAuthConfig({
        ...minimalConfig,
        session: { strategy: "invalid" as never },
      }),
    ).toThrow();
  });

  it("throws on invalid database adapter", () => {
    expect(() =>
      defineAuthConfig({
        database: { adapter: "mongodb" as never },
      }),
    ).toThrow();
  });

  it("accepts OAuth config", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          github: {
            enabled: true,
            clientId: "gh_client",
            clientSecret: "gh_secret",
          },
        },
      },
    });
    expect(config.features.oauth.github?.enabled).toBe(true);
    expect(config.features.oauth.github?.clientId).toBe("gh_client");
  });

  it("accepts custom OAuth providers", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          custom: [
            {
              id: "microsoft",
              clientId: "ms_id",
              clientSecret: "ms_secret",
            },
          ],
        },
      },
    });
    expect(config.features.oauth.custom).toHaveLength(1);
    expect(config.features.oauth.custom?.[0]?.id).toBe("microsoft");
  });

  it("validates complete config with all sections", () => {
    const config = defineAuthConfig({
      database: { adapter: "drizzle", url: "postgresql://localhost/mydb" },
      features: {
        emailPassword: {
          enabled: true,
          requireEmailVerification: true,
          passwordMinLength: 10,
          passwordMaxLength: 64,
          disableSignUp: false,
          autoSignIn: true,
        },
        passwordReset: true,
        oauth: {
          google: {
            enabled: true,
            clientId: "google_client",
            clientSecret: "google_secret",
          },
        },
        twoFactor: {
          enabled: true,
          methods: ["totp"],
        },
        roles: {
          enabled: true,
          defaultRole: "member",
          roles: ["user", "admin", "member"],
        },
      },
      session: {
        expiresIn: "24h",
        strategy: "database",
        cookieName: "my_session",
        updateAge: "30m",
        cookieCache: true,
      },
      ui: {
        theme: "shadcn",
        redirectAfterLogin: "/app",
        redirectAfterLogout: "/welcome",
      },
    } satisfies AuthConfigInput);

    expect(config.database.adapter).toBe("drizzle");
    expect(config.features.emailPassword.enabled).toBe(true);
    expect(config.features.passwordReset).toBe(true);
    expect(config.features.oauth.google?.enabled).toBe(true);
    expect(config.features.twoFactor.enabled).toBe(true);
    expect(config.features.roles.defaultRole).toBe("member");
    expect(config.session.expiresIn).toBe("24h");
    expect(config.session.strategy).toBe("database");
    expect(config.ui.redirectAfterLogin).toBe("/app");
  });

  it("rejects missing database config", () => {
    expect(() =>
      defineAuthConfig({} as AuthConfigInput),
    ).toThrow();
  });
});
