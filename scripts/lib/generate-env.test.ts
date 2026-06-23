import { describe, it, expect } from "vitest";
import { defineAuthConfig } from "@/auth/config";
import { collectEnvVars, generateEnvExample } from "./generate-env";
import type { AuthConfigInput } from "@/auth/config/types";

const minimalConfig = {
  database: { adapter: "prisma" as const, url: "postgresql://localhost/mydb" },
} satisfies AuthConfigInput;

describe("collectEnvVars", () => {
  it("includes DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL for minimal config", () => {
    const config = defineAuthConfig(minimalConfig);
    const vars = collectEnvVars(config);

    const keys = vars.map((v) => v.key);
    expect(keys).toContain("DATABASE_URL");
    expect(keys).toContain("BETTER_AUTH_SECRET");
    expect(keys).toContain("BETTER_AUTH_URL");

    const required = vars.filter((v) => v.required).map((v) => v.key);
    expect(required).toEqual(["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"]);
  });

  it("omits GITHUB env vars from required when GitHub is disabled", () => {
    const config = defineAuthConfig(minimalConfig);
    const vars = collectEnvVars(config);

    const githubId = vars.find((v) => v.key === "GITHUB_CLIENT_ID");
    expect(githubId).toBeDefined();
    expect(githubId?.required).toBe(false);

    const githubSecret = vars.find((v) => v.key === "GITHUB_CLIENT_SECRET");
    expect(githubSecret).toBeDefined();
    expect(githubSecret?.required).toBe(false);
  });

  it("includes GITHUB env vars as required when GitHub OAuth is enabled", () => {
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
    const vars = collectEnvVars(config);

    expect(vars.find((v) => v.key === "GITHUB_CLIENT_ID")?.required).toBe(true);
    expect(vars.find((v) => v.key === "GITHUB_CLIENT_SECRET")?.required).toBe(true);
  });

  it("includes GOOGLE env vars as required when Google OAuth is enabled", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          google: {
            enabled: true,
            clientId: "google_client",
            clientSecret: "google_secret",
          },
        },
      },
    });
    const vars = collectEnvVars(config);

    expect(vars.find((v) => v.key === "GOOGLE_CLIENT_ID")?.required).toBe(true);
    expect(vars.find((v) => v.key === "GOOGLE_CLIENT_SECRET")?.required).toBe(true);
  });

  it("generates env vars for custom OAuth providers", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          custom: [
            { id: "microsoft", clientId: "ms_id", clientSecret: "ms_secret" },
          ],
        },
      },
    });
    const vars = collectEnvVars(config);

    expect(vars.find((v) => v.key === "MICROSOFT_CLIENT_ID")).toBeDefined();
    expect(vars.find((v) => v.key === "MICROSOFT_CLIENT_SECRET")).toBeDefined();
  });

  it("sanitizes provider names with non-alphanumeric characters", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          custom: [
            { id: "my-custom-provider", clientId: "id", clientSecret: "secret" },
          ],
        },
      },
    });
    const vars = collectEnvVars(config);

    const idVar = vars.find((v) => v.key === "MY_CUSTOM_PROVIDER_CLIENT_ID");
    expect(idVar).toBeDefined();
    expect(idVar?.required).toBe(true);
  });

  it("includes disabled custom provider vars as not required", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          custom: [
            { id: "microsoft", clientId: "ms_id", clientSecret: "ms_secret", enabled: false },
          ],
        },
      },
    });
    const vars = collectEnvVars(config);

    expect(vars.find((v) => v.key === "MICROSOFT_CLIENT_ID")?.required).toBe(false);
  });

  it("returns all env vars when all OAuth features are enabled", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          github: { enabled: true, clientId: "a", clientSecret: "b" },
          google: { enabled: true, clientId: "c", clientSecret: "d" },
          custom: [
            { id: "discord", clientId: "e", clientSecret: "f" },
          ],
        },
      },
    });
    const vars = collectEnvVars(config);

    const requiredKeys = vars.filter((v) => v.required).map((v) => v.key);
    expect(requiredKeys).toContain("GITHUB_CLIENT_ID");
    expect(requiredKeys).toContain("GITHUB_CLIENT_SECRET");
    expect(requiredKeys).toContain("GOOGLE_CLIENT_ID");
    expect(requiredKeys).toContain("GOOGLE_CLIENT_SECRET");
    expect(requiredKeys).toContain("DISCORD_CLIENT_ID");
    expect(requiredKeys).toContain("DISCORD_CLIENT_SECRET");
  });
});

describe("generateEnvExample", () => {
  it("produces a string with section headers and env var entries", () => {
    const config = defineAuthConfig(minimalConfig);
    const output = generateEnvExample(config);

    expect(output).toContain("DATABASE_URL=");
    expect(output).toContain("BETTER_AUTH_SECRET=");
    expect(output).toContain("BETTER_AUTH_URL=");
    expect(output).toContain("─── Database ───");
    expect(output).toContain("─── Better Auth ───");
    expect(output).toContain("─── OAuth Providers ───");
  });

  it("comments out disabled OAuth provider vars", () => {
    const config = defineAuthConfig(minimalConfig);
    const output = generateEnvExample(config);

    expect(output).toContain("# GITHUB_CLIENT_ID=");
    expect(output).toContain("# GITHUB_CLIENT_SECRET=");
  });

  it("uncomments enabled OAuth provider vars", () => {
    const config = defineAuthConfig({
      ...minimalConfig,
      features: {
        oauth: {
          github: { enabled: true, clientId: "a", clientSecret: "b" },
        },
      },
    });
    const output = generateEnvExample(config);

    expect(output).toContain("GITHUB_CLIENT_ID=");
    expect(output).not.toContain("# GITHUB_CLIENT_ID=");
  });
});
