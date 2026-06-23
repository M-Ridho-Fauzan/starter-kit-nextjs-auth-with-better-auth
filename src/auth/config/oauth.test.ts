import { describe, it, expect } from "vitest";
import { defineAuthConfig } from "./index";
import { getEnabledOAuthProviders } from "./oauth";

const baseConfig = {
  database: {
    adapter: "prisma" as const,
    url: "postgresql://localhost:5432/db",
  },
};

describe("getEnabledOAuthProviders", () => {
  it("returns empty array when no OAuth providers are configured", () => {
    const config = defineAuthConfig(baseConfig);
    expect(getEnabledOAuthProviders(config)).toEqual([]);
  });

  it("returns github when enabled", () => {
    const config = defineAuthConfig({
      ...baseConfig,
      features: {
        oauth: {
          github: {
            enabled: true,
            clientId: "gh_id",
            clientSecret: "gh_secret",
          },
        },
      },
    });
    expect(getEnabledOAuthProviders(config)).toEqual(["github"]);
  });

  it("returns google when enabled", () => {
    const config = defineAuthConfig({
      ...baseConfig,
      features: {
        oauth: {
          google: {
            enabled: true,
            clientId: "gl_id",
            clientSecret: "gl_secret",
          },
        },
      },
    });
    expect(getEnabledOAuthProviders(config)).toEqual(["google"]);
  });

  it("returns both github and google when both enabled", () => {
    const config = defineAuthConfig({
      ...baseConfig,
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
    expect(getEnabledOAuthProviders(config)).toEqual(["github", "google"]);
  });

  it("excludes disabled providers", () => {
    const config = defineAuthConfig({
      ...baseConfig,
      features: {
        oauth: {
          github: {
            enabled: false,
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
    expect(getEnabledOAuthProviders(config)).toEqual(["google"]);
  });

  it("returns custom providers when enabled", () => {
    const config = defineAuthConfig({
      ...baseConfig,
      features: {
        oauth: {
          custom: [
            { id: "discord", clientId: "dc_id", clientSecret: "dc_secret", enabled: true },
          ],
        },
      },
    });
    expect(getEnabledOAuthProviders(config)).toEqual(["discord"]);
  });

  it("excludes disabled custom providers", () => {
    const config = defineAuthConfig({
      ...baseConfig,
      features: {
        oauth: {
          custom: [
            { id: "discord", clientId: "dc_id", clientSecret: "dc_secret", enabled: false },
          ],
        },
      },
    });
    expect(getEnabledOAuthProviders(config)).toEqual([]);
  });

  it("returns mixed built-in and custom providers", () => {
    const config = defineAuthConfig({
      ...baseConfig,
      features: {
        oauth: {
          github: {
            enabled: true,
            clientId: "gh_id",
            clientSecret: "gh_secret",
          },
          custom: [
            { id: "discord", clientId: "dc_id", clientSecret: "dc_secret" },
          ],
        },
      },
    });
    expect(getEnabledOAuthProviders(config)).toEqual(["github", "discord"]);
  });
});
