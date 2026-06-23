import { describe, it, expect } from "vitest";
import { generateAuthConfigFile } from "./write-config";
import type { SetupSelections } from "./write-config";

const defaultSelections: SetupSelections = {
  database: {
    adapter: "prisma",
    url: "postgresql://localhost/mydb",
  },
  features: {
    emailPassword: {
      enabled: false,
      requireEmailVerification: false,
      passwordMinLength: 8,
    },
    passwordReset: false,
    oauth: {
      github: { enabled: false, clientId: "", clientSecret: "" },
      google: { enabled: false, clientId: "", clientSecret: "" },
      custom: [],
    },
    twoFactor: { enabled: false },
    roles: {
      enabled: false,
      defaultRole: "user",
      roles: ["user", "admin"],
    },
  },
  session: {
    strategy: "jwt",
    expiresIn: "7d",
    cookieName: "auth_session",
  },
  ui: {
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/",
  },
};

describe("generateAuthConfigFile", () => {
  it("includes the defineAuthConfig import", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).toContain('import { defineAuthConfig } from "@/auth/config"');
  });

  it("includes database config with adapter and url", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).toContain('adapter: "prisma"');
    expect(output).toContain("process.env.DATABASE_URL!");
  });

  it("includes session config with expiresIn, strategy, and cookieName", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).toContain('expiresIn: "7d"');
    expect(output).toContain('strategy: "jwt"');
    expect(output).toContain('cookieName: "auth_session"');
  });

  it("includes ui section with redirect config", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).toContain('theme: "shadcn"');
    expect(output).toContain('redirectAfterLogin: "/dashboard"');
    expect(output).toContain('redirectAfterLogout: "/"');
  });

  it("includes emailPassword section when enabled", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: {
        ...defaultSelections.features,
        emailPassword: { enabled: true, requireEmailVerification: true, passwordMinLength: 10 },
      },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain("emailPassword: {");
    expect(output).toContain("enabled: true,");
    expect(output).toContain("requireEmailVerification: true,");
    expect(output).toContain("passwordMinLength: 10,");
  });

  it("omits emailPassword section when disabled", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).not.toContain("emailPassword:");
  });

  it("includes passwordReset when enabled", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: { ...defaultSelections.features, passwordReset: true },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain("passwordReset: true,");
  });

  it("omits passwordReset when disabled", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).not.toContain("passwordReset:");
  });

  it("includes GitHub OAuth section when enabled", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: {
        ...defaultSelections.features,
        oauth: {
          github: { enabled: true, clientId: "gh", clientSecret: "gh_secret" },
          google: { enabled: false, clientId: "", clientSecret: "" },
          custom: [],
        },
      },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain("github: {");
    expect(output).toContain("process.env.GITHUB_CLIENT_ID!");
  });

  it("includes Google OAuth section when enabled", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: {
        ...defaultSelections.features,
        oauth: {
          github: { enabled: false, clientId: "", clientSecret: "" },
          google: { enabled: true, clientId: "google", clientSecret: "google_secret" },
          custom: [],
        },
      },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain("google: {");
    expect(output).toContain("process.env.GOOGLE_CLIENT_ID!");
  });

  it("includes custom OAuth providers", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: {
        ...defaultSelections.features,
        oauth: {
          github: { enabled: false, clientId: "", clientSecret: "" },
          google: { enabled: false, clientId: "", clientSecret: "" },
          custom: [{ id: "microsoft", clientId: "ms", clientSecret: "ms_secret" }],
        },
      },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain('id: "microsoft"');
    expect(output).toContain("process.env.MICROSOFT_CLIENT_ID!");
  });

  it("omits oauth section when no providers enabled", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).not.toContain("oauth:");
  });

  it("includes twoFactor section when enabled", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: { ...defaultSelections.features, twoFactor: { enabled: true } },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain("twoFactor: {");
    expect(output).toContain('enabled: true,');
    expect(output).toContain('methods: ["totp"],');
  });

  it("omits twoFactor section when disabled", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).not.toContain("twoFactor:");
  });

  it("includes roles section when enabled", () => {
    const selections: SetupSelections = {
      ...defaultSelections,
      features: {
        ...defaultSelections.features,
        roles: { enabled: true, defaultRole: "admin", roles: ["user", "admin"] },
      },
    };
    const output = generateAuthConfigFile(selections);
    expect(output).toContain('enabled: true,');
    expect(output).toContain('defaultRole: "admin"');
    expect(output).toContain('roles: ["user","admin"]');
  });

  it("omits roles section when disabled", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output).not.toContain("roles: {");
  });

  it("starts with JSDoc comment", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output.startsWith("/**")).toBe(true);
  });

  it("ends with newline", () => {
    const output = generateAuthConfigFile(defaultSelections);
    expect(output.endsWith("\n")).toBe(true);
  });
});
