import type { AuthConfig } from "@/auth/config/types";

/**
 * Environment variable entry for `.env.example` generation.
 *
 * @param key - Environment variable name (e.g. `DATABASE_URL`).
 * @param value - Default or placeholder value.
 * @param required - Whether the variable must be set for the app to work.
 * @param description - Human-readable description of the variable's purpose.
 */
export interface EnvVarEntry {
  key: string;
  value: string;
  required: boolean;
  description: string;
}

function sanitizeProviderId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
}

/**
 * Collect all environment variables required by the given auth configuration.
 *
 * Always includes `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`.
 * Conditionally includes OAuth provider variables based on which providers are
 * enabled.
 *
 * @param config - Fully resolved auth configuration.
 * @returns An array of environment variable entries.
 */
export function collectEnvVars(config: AuthConfig): EnvVarEntry[] {
  const vars: EnvVarEntry[] = [];

  vars.push({
    key: "DATABASE_URL",
    value: "",
    required: true,
    description: "Database connection URL",
  });

  vars.push({
    key: "BETTER_AUTH_SECRET",
    value: "",
    required: true,
    description: "Secret key for token signing (min 32 characters, generate with `openssl rand -base64 32`)",
  });

  vars.push({
    key: "BETTER_AUTH_URL",
    value: "http://localhost:3000",
    required: true,
    description: "Your application's public URL",
  });

  const oauth = config.features.oauth;

  const github = oauth.github;
  if (github?.enabled) {
    vars.push({
      key: "GITHUB_CLIENT_ID",
      value: "",
      required: true,
      description: "GitHub OAuth App client ID",
    });
    vars.push({
      key: "GITHUB_CLIENT_SECRET",
      value: "",
      required: true,
      description: "GitHub OAuth App client secret",
    });
  } else {
    vars.push({
      key: "GITHUB_CLIENT_ID",
      value: "",
      required: false,
      description: "GitHub OAuth App client ID (required when GitHub OAuth is enabled)",
    });
    vars.push({
      key: "GITHUB_CLIENT_SECRET",
      value: "",
      required: false,
      description: "GitHub OAuth App client secret (required when GitHub OAuth is enabled)",
    });
  }

  const google = oauth.google;
  if (google?.enabled) {
    vars.push({
      key: "GOOGLE_CLIENT_ID",
      value: "",
      required: true,
      description: "Google OAuth client ID",
    });
    vars.push({
      key: "GOOGLE_CLIENT_SECRET",
      value: "",
      required: true,
      description: "Google OAuth client secret",
    });
  } else {
    vars.push({
      key: "GOOGLE_CLIENT_ID",
      value: "",
      required: false,
      description: "Google OAuth client ID (required when Google OAuth is enabled)",
    });
    vars.push({
      key: "GOOGLE_CLIENT_SECRET",
      value: "",
      required: false,
      description: "Google OAuth client secret (required when Google OAuth is enabled)",
    });
  }

  const customProviders = oauth.custom ?? [];
  for (const provider of customProviders) {
    const prefix = sanitizeProviderId(provider.id);
    if (provider.enabled) {
      vars.push({
        key: `${prefix}_CLIENT_ID`,
        value: "",
        required: true,
        description: `Custom OAuth provider "${provider.id}" client ID`,
      });
      vars.push({
        key: `${prefix}_CLIENT_SECRET`,
        value: "",
        required: true,
        description: `Custom OAuth provider "${provider.id}" client secret`,
      });
    } else {
      vars.push({
        key: `${prefix}_CLIENT_ID`,
        value: "",
        required: false,
        description: `Custom OAuth provider "${provider.id}" client ID (required when enabled)`,
      });
      vars.push({
        key: `${prefix}_CLIENT_SECRET`,
        value: "",
        required: false,
        description: `Custom OAuth provider "${provider.id}" client secret (required when enabled)`,
      });
    }
  }

  return vars;
}

/**
 * Format a single environment variable entry for `.env.example`.
 *
 * Required variables are uncommented; optional variables are commented out.
 *
 * @param entry - The environment variable entry to format.
 * @returns A formatted string suitable for inclusion in `.env.example`.
 */
export function formatEnvVar(entry: EnvVarEntry): string {
  const assignment = `${entry.key}=${entry.value}`;
  if (entry.required) {
    return `# ${entry.description}\n${assignment}`;
  }
  return `# ${entry.description}\n# ${assignment}`;
}

/**
 * Generate the complete `.env.example` file content from an auth configuration.
 *
 * Collects all required environment variables and formats them with section
 * headers and descriptions.
 *
 * @param config - Fully resolved auth configuration.
 * @returns Complete `.env.example` file content as a string.
 */
export function generateEnvExample(config: AuthConfig): string {
  const vars = collectEnvVars(config);

  return [
    "# ═══════════════════════════════════════════",
    "# NextJS Auth Starter Kit — Environment Variables",
    "# ═══════════════════════════════════════════",
    "",
    "# Copy this file to .env and fill in your values:",
    "#   cp .env.example .env",
    "",
    "# ─── Database ───",
    "",
    formatEnvVar(vars.find((v) => v.key === "DATABASE_URL")!),
    "",
    "# ─── Better Auth ───",
    "",
    formatEnvVar(vars.find((v) => v.key === "BETTER_AUTH_SECRET")!),
    "",
    formatEnvVar(vars.find((v) => v.key === "BETTER_AUTH_URL")!),
    "",
    "# ─── OAuth Providers ───",
    "",
    formatEnvVar(vars.find((v) => v.key === "GITHUB_CLIENT_ID")!),
    "",
    formatEnvVar(vars.find((v) => v.key === "GITHUB_CLIENT_SECRET")!),
    "",
    formatEnvVar(vars.find((v) => v.key === "GOOGLE_CLIENT_ID")!),
    "",
    formatEnvVar(vars.find((v) => v.key === "GOOGLE_CLIENT_SECRET")!),
    ...vars
      .filter(
        (v) =>
          v.key !== "DATABASE_URL" &&
          v.key !== "BETTER_AUTH_SECRET" &&
          v.key !== "BETTER_AUTH_URL" &&
          v.key !== "GITHUB_CLIENT_ID" &&
          v.key !== "GITHUB_CLIENT_SECRET" &&
          v.key !== "GOOGLE_CLIENT_ID" &&
          v.key !== "GOOGLE_CLIENT_SECRET",
      )
      .flatMap((v) => ["", formatEnvVar(v)]),
    "",
  ].join("\n");
}
