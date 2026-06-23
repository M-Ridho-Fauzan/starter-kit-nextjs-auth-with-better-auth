/**
 * GitHub OAuth provider selections from the setup wizard.
 */
export interface OAuthProviderSelections {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
}

/**
 * Custom OAuth provider selections from the setup wizard.
 */
export interface CustomOAuthProviderSelections {
  id: string;
  clientId: string;
  clientSecret: string;
}

/**
 * Complete setup selections captured by the interactive wizard.
 * This type drives the generated `auth.config.ts` content.
 */
export interface SetupSelections {
  database: {
    adapter: "prisma" | "drizzle" | "kysely" | "mongoose";
    url: string;
  };
  features: {
    emailPassword: {
      enabled: boolean;
      requireEmailVerification: boolean;
      passwordMinLength: number;
    };
    passwordReset: boolean;
    oauth: {
      github: OAuthProviderSelections;
      google: OAuthProviderSelections;
      custom: CustomOAuthProviderSelections[];
    };
    twoFactor: { enabled: boolean };
    roles: {
      enabled: boolean;
      defaultRole: string;
      roles: string[];
    };
  };
  session: {
    strategy: "jwt" | "database";
    expiresIn: string;
    cookieName: string;
  };
  ui: {
    redirectAfterLogin: string;
    redirectAfterLogout: string;
  };
}

function renderFeatures(selections: SetupSelections): string {
  const lines: string[] = ["    features: {"];

  if (selections.features.emailPassword.enabled) {
    lines.push("      emailPassword: {");
    lines.push("        enabled: true,");
    lines.push(`        requireEmailVerification: ${selections.features.emailPassword.requireEmailVerification},`);
    lines.push(`        passwordMinLength: ${selections.features.emailPassword.passwordMinLength},`);
    lines.push("      },");
  }

  if (selections.features.passwordReset) {
    lines.push("      passwordReset: true,");
  }

  const hasOAuth =
    selections.features.oauth.github.enabled ||
    selections.features.oauth.google.enabled ||
    selections.features.oauth.custom.length > 0;

  if (hasOAuth) {
    lines.push("      oauth: {");

    if (selections.features.oauth.github.enabled) {
      lines.push("        github: {");
      lines.push("          enabled: true,");
      lines.push("          clientId: process.env.GITHUB_CLIENT_ID!,");
      lines.push("          clientSecret: process.env.GITHUB_CLIENT_SECRET!,");
      lines.push("        },");
    }

    if (selections.features.oauth.google.enabled) {
      lines.push("        google: {");
      lines.push("          enabled: true,");
      lines.push("          clientId: process.env.GOOGLE_CLIENT_ID!,");
      lines.push("          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,");
      lines.push("        },");
    }

    if (selections.features.oauth.custom.length > 0) {
      lines.push("        custom: [");
      for (const provider of selections.features.oauth.custom) {
        const upperId = provider.id.toUpperCase();
        lines.push("          {");
        lines.push(`            id: "${provider.id}",`);
        lines.push(`            clientId: process.env.${upperId}_CLIENT_ID!,`);
        lines.push(`            clientSecret: process.env.${upperId}_CLIENT_SECRET!,`);
        lines.push("          },");
      }
      lines.push("        ],");
    }

    lines.push("      },");
  }

  if (selections.features.twoFactor.enabled) {
    lines.push("      twoFactor: {");
    lines.push("        enabled: true,");
    lines.push('        methods: ["totp"],');
    lines.push("      },");
  }

  if (selections.features.roles.enabled) {
    lines.push("      roles: {");
    lines.push("        enabled: true,");
    lines.push(`        defaultRole: "${selections.features.roles.defaultRole}",`);
    lines.push(`        roles: ${JSON.stringify(selections.features.roles.roles)},`);
    lines.push("      },");
  }

  lines.push("    },");
  return lines.join("\n");
}

/**
 * Generate the content of an `auth.config.ts` file from setup selections.
 *
 * Produces a complete, ready-to-write TypeScript file that imports
 * `defineAuthConfig` and configures all selected features.
 *
 * @param selections - Setup selections collected by the interactive wizard.
 * @returns Complete `auth.config.ts` file content as a string.
 */
export function generateAuthConfigFile(selections: SetupSelections): string {
  const lines: string[] = [];

  lines.push("/**");
  lines.push(" * Auth configuration entry point.");
  lines.push(" *");
  lines.push(" * Customize this file to match your application's needs.");
  lines.push(" * All values flow from here — zero hardcoding in the source.");
  lines.push(" */");
  lines.push('import { defineAuthConfig } from "@/auth/config";');
  lines.push("");
  lines.push("export default defineAuthConfig({");
  lines.push("  database: {");
  lines.push(`    adapter: "${selections.database.adapter}",`);
  lines.push("    url: process.env.DATABASE_URL!,");
  lines.push("  },");
  lines.push("");
  lines.push(renderFeatures(selections));
  lines.push("");
  lines.push("  session: {");
  lines.push(`    expiresIn: "${selections.session.expiresIn}",`);
  lines.push(`    strategy: "${selections.session.strategy}",`);
  lines.push(`    cookieName: "${selections.session.cookieName}",`);
  lines.push("  },");
  lines.push("");
  lines.push("  ui: {");
  lines.push('    theme: "shadcn",');
  lines.push(`    redirectAfterLogin: "${selections.ui.redirectAfterLogin}",`);
  lines.push(`    redirectAfterLogout: "${selections.ui.redirectAfterLogout}",`);
  lines.push("  },");
  lines.push("});");
  lines.push("");

  return lines.join("\n");
}
