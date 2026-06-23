import { intro, outro, select, text, confirm, password, isCancel, cancel } from "@clack/prompts";
import { writeFile } from "node:fs/promises";
import { generateAuthConfigFile } from "./lib/write-config";
import { generateEnvExample } from "./lib/generate-env";
import { defineAuthConfig } from "@/auth/config";
import type { AuthConfigInput } from "@/auth/config/types";

function durationValidator(value: string | undefined): string | Error | undefined {
  if (!value) return "Duration is required";
  if (!/^\d+[smhd]$/.test(value)) return 'Must be a duration string like "7d", "1h", "30m"';
}

function urlValidator(value: string | undefined): string | Error | undefined {
  if (!value) return "URL is required";
  try {
    new URL(value);
  } catch {
    return "Must be a valid URL";
  }
}

async function main(): Promise<void> {
  intro("NextJS Auth Starter Kit Setup");

  const adapter = await select({
    message: "Which database adapter do you want to use?",
    options: [
      { value: "prisma" as const, label: "Prisma" },
      { value: "drizzle" as const, label: "Drizzle" },
      { value: "kysely" as const, label: "Kysely" },
      { value: "mongoose" as const, label: "Mongoose" },
    ],
  });
  if (isCancel(adapter)) {
    cancel("Setup cancelled.");
    return;
  }

  const databaseUrl = await text({
    message: "Enter your database connection URL",
    placeholder: "postgresql://localhost:5432/mydb",
    validate: urlValidator,
  });
  if (isCancel(databaseUrl)) {
    cancel("Setup cancelled.");
    return;
  }

  const emailPasswordEnabled = await confirm({
    message: "Enable email/password authentication?",
    initialValue: true,
  });
  if (isCancel(emailPasswordEnabled)) {
    cancel("Setup cancelled.");
    return;
  }

  let requireEmailVerification = false;
  let passwordMinLength = 8;
  if (emailPasswordEnabled as boolean) {
    const emailVerificationResult = await confirm({
      message: "Require email verification before sign-in?",
      initialValue: false,
    });
    if (isCancel(emailVerificationResult)) {
      cancel("Setup cancelled.");
      return;
    }
    requireEmailVerification = emailVerificationResult as boolean;

    const minLength = await text({
      message: "Minimum password length",
      initialValue: "8",
      validate: (v: string | undefined) => {
        const n = Number(v);
        if (!Number.isInteger(n) || n < 1) return "Must be a positive integer";
      },
    });
    if (isCancel(minLength)) {
      cancel("Setup cancelled.");
      return;
    }
    passwordMinLength = Number(minLength as string);
  }

  const passwordReset = await confirm({
    message: "Enable password reset?",
    initialValue: true,
  });
  if (isCancel(passwordReset)) {
    cancel("Setup cancelled.");
    return;
  }

  const githubEnabled = await confirm({
    message: "Enable GitHub OAuth?",
    initialValue: false,
  });
  if (isCancel(githubEnabled)) {
    cancel("Setup cancelled.");
    return;
  }

  let githubClientId = "";
  let githubClientSecret = "";
  if (githubEnabled as boolean) {
    const ghIdResult = await text({
      message: "GitHub OAuth Client ID",
      validate: (v: string | undefined) => (v ? undefined : "Client ID is required"),
    });
    if (isCancel(ghIdResult)) {
      cancel("Setup cancelled.");
      return;
    }
    githubClientId = ghIdResult as string;

    const ghSecretResult = await password({
      message: "GitHub OAuth Client Secret",
      validate: (v: string | undefined) => (v ? undefined : "Client Secret is required"),
    });
    if (isCancel(ghSecretResult)) {
      cancel("Setup cancelled.");
      return;
    }
    githubClientSecret = ghSecretResult as string;
  }

  const googleEnabled = await confirm({
    message: "Enable Google OAuth?",
    initialValue: false,
  });
  if (isCancel(googleEnabled)) {
    cancel("Setup cancelled.");
    return;
  }

  let googleClientId = "";
  let googleClientSecret = "";
  if (googleEnabled as boolean) {
    const gIdResult = await text({
      message: "Google OAuth Client ID",
      validate: (v: string | undefined) => (v ? undefined : "Client ID is required"),
    });
    if (isCancel(gIdResult)) {
      cancel("Setup cancelled.");
      return;
    }
    googleClientId = gIdResult as string;

    const gSecretResult = await password({
      message: "Google OAuth Client Secret",
      validate: (v: string | undefined) => (v ? undefined : "Client Secret is required"),
    });
    if (isCancel(gSecretResult)) {
      cancel("Setup cancelled.");
      return;
    }
    googleClientSecret = gSecretResult as string;
  }

  const customProviders: Array<{ id: string; clientId: string; clientSecret: string }> = [];
  let addCustom = true;
  while (addCustom) {
    const customConfirmResult = await confirm({
      message: customProviders.length === 0
        ? "Add a custom OAuth provider?"
        : "Add another custom OAuth provider?",
      initialValue: false,
    });
    if (isCancel(customConfirmResult)) {
      cancel("Setup cancelled.");
      return;
    }
    addCustom = customConfirmResult as boolean;

    if (addCustom) {
      const providerId = await text({
        message: "Custom provider ID (e.g. 'microsoft', 'discord')",
        validate: (v: string | undefined) => (v ? undefined : "Provider ID is required"),
      });
      if (isCancel(providerId)) {
        cancel("Setup cancelled.");
        return;
      }

      const customClientId = await text({
        message: `Client ID for ${providerId as string}`,
        validate: (v: string | undefined) => (v ? undefined : "Client ID is required"),
      });
      if (isCancel(customClientId)) {
        cancel("Setup cancelled.");
        return;
      }

      const customClientSecret = await password({
        message: `Client Secret for ${providerId as string}`,
        validate: (v: string | undefined) => (v ? undefined : "Client Secret is required"),
      });
      if (isCancel(customClientSecret)) {
        cancel("Setup cancelled.");
        return;
      }

      customProviders.push({
        id: providerId as string,
        clientId: customClientId as string,
        clientSecret: customClientSecret as string,
      });
    }
  }

  const twoFactorEnabled = await confirm({
    message: "Enable two-factor authentication (TOTP)?",
    initialValue: false,
  });
  if (isCancel(twoFactorEnabled)) {
    cancel("Setup cancelled.");
    return;
  }

  const rolesEnabled = await confirm({
    message: "Enable role-based access control?",
    initialValue: false,
  });
  if (isCancel(rolesEnabled)) {
    cancel("Setup cancelled.");
    return;
  }

  let defaultRole = "user";
  let rolesList = ["user", "admin"];
  if (rolesEnabled as boolean) {
    const dRole = await text({
      message: "Default role name",
      initialValue: "user",
      validate: (v: string | undefined) => (v ? undefined : "Role name is required"),
    });
    if (isCancel(dRole)) {
      cancel("Setup cancelled.");
      return;
    }
    defaultRole = dRole as string;

    const rolesStr = await text({
      message: "Comma-separated list of roles",
      initialValue: "user,admin",
      validate: (v: string | undefined) => (v ? undefined : "At least one role is required"),
    });
    if (isCancel(rolesStr)) {
      cancel("Setup cancelled.");
      return;
    }
    rolesList = (rolesStr as string).split(",").map((r: string) => r.trim()).filter(Boolean);
  }

  const sessionStrategy = await select({
    message: "Session strategy",
    options: [
      { value: "jwt" as const, label: "JWT (stateless, no DB lookup)" },
      { value: "database" as const, label: "Database (revocable sessions)" },
    ],
  });
  if (isCancel(sessionStrategy)) {
    cancel("Setup cancelled.");
    return;
  }

  const expiresIn = await text({
    message: "Session expiry duration",
    initialValue: "7d",
    validate: durationValidator,
  });
  if (isCancel(expiresIn)) {
    cancel("Setup cancelled.");
    return;
  }

  const redirectAfterLogin = await text({
    message: "Redirect URL after login",
    initialValue: "/dashboard",
  });
  if (isCancel(redirectAfterLogin)) {
    cancel("Setup cancelled.");
    return;
  }

  const redirectAfterLogout = await text({
    message: "Redirect URL after logout",
    initialValue: "/",
  });
  if (isCancel(redirectAfterLogout)) {
    cancel("Setup cancelled.");
    return;
  }

  const selections = {
    database: { adapter, url: databaseUrl as string },
    features: {
      emailPassword: {
        enabled: emailPasswordEnabled as boolean,
        requireEmailVerification,
        passwordMinLength,
      },
      passwordReset: passwordReset as boolean,
      oauth: {
        github: { enabled: githubEnabled as boolean, clientId: githubClientId, clientSecret: githubClientSecret },
        google: { enabled: googleEnabled as boolean, clientId: googleClientId, clientSecret: googleClientSecret },
        custom: customProviders,
      },
      twoFactor: { enabled: twoFactorEnabled as boolean },
      roles: { enabled: rolesEnabled as boolean, defaultRole, roles: rolesList },
    },
    session: {
      strategy: sessionStrategy as "jwt" | "database",
      expiresIn: expiresIn as string,
      cookieName: "auth_session",
    },
    ui: {
      redirectAfterLogin: redirectAfterLogin as string,
      redirectAfterLogout: redirectAfterLogout as string,
    },
  };

  const generate = await confirm({
    message: "Generate auth.config.ts and .env.example?",
    initialValue: true,
  });
  if (isCancel(generate)) {
    cancel("Setup cancelled.");
    return;
  }

  if (generate as boolean) {
    const configContent = generateAuthConfigFile(selections);
    await writeFile("auth.config.ts", configContent, "utf-8");

    const configInput: AuthConfigInput = {
      database: { adapter, url: databaseUrl as string },
      features: {
        emailPassword: (emailPasswordEnabled as boolean)
          ? { enabled: true, requireEmailVerification, passwordMinLength }
          : undefined,
        passwordReset: (passwordReset as boolean) ? true : undefined,
        oauth: {
          github: (githubEnabled as boolean)
            ? { enabled: true, clientId: githubClientId, clientSecret: githubClientSecret }
            : undefined,
          google: (googleEnabled as boolean)
            ? { enabled: true, clientId: googleClientId, clientSecret: googleClientSecret }
            : undefined,
          custom: customProviders.length > 0 ? customProviders : undefined,
        },
        twoFactor: (twoFactorEnabled as boolean) ? { enabled: true } : undefined,
        roles: (rolesEnabled as boolean) ? { enabled: true, defaultRole, roles: rolesList } : undefined,
      },
      session: { strategy: sessionStrategy as "jwt" | "database", expiresIn: expiresIn as string },
      ui: { redirectAfterLogin: redirectAfterLogin as string, redirectAfterLogout: redirectAfterLogout as string },
    };

    const resolvedConfig = defineAuthConfig(configInput);
    const envContent = generateEnvExample(resolvedConfig);
    await writeFile(".env.example", envContent, "utf-8");

    outro("Setup complete! Next steps:\n\n  1. Copy .env.example to .env and fill in your values\n  2. Set up your database (run migrations)\n  3. Run `pnpm dev` to start the development server\n");
  } else {
    outro("Setup cancelled. No files were written.");
  }
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
