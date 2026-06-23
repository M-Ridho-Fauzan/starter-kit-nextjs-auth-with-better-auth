import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import type { AuthConfig } from "./config/types";
import { resolveAdapter } from "./adapters/index";

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(
      `Invalid duration string: "${duration}". Expected format like "7d", "1h", "30m".`,
    );
  }
  const value = Number.parseInt(match[1]!, 10);
  const unit = match[2]!;
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3_600;
    case "d":
      return value * 86_400;
    default:
      throw new Error(`Unknown duration unit: "${unit}"`);
  }
}

/**
 * Maps our config-driven `AuthConfig` to Better Auth's native options format.
 * Called once by `server.ts` at startup.
 *
 * @internal — not exported to user-facing modules.
 */
export function mapConfig(config: AuthConfig): BetterAuthOptions {
  return {
    ...mapDatabase(config.database),
    ...mapEmailPasswordAndVerification(config),
    ...mapOAuth(config),
    ...mapSession(config.session),
    ...mapAdvanced(config),
    plugins: resolvePlugins(config),
    user: buildUserConfig(config),
  };
}

function mapDatabase(
  database: AuthConfig["database"],
): Pick<BetterAuthOptions, "database"> {
  return {
    database: resolveAdapter(database) as BetterAuthOptions["database"],
  };
}

function mapEmailPasswordAndVerification(
  config: AuthConfig,
): Pick<BetterAuthOptions, "emailAndPassword" | "emailVerification"> {
  const ep = config.features.emailPassword;
  if (!ep.enabled) {
    return {};
  }

  const pr = config.features.passwordReset;
  const resetTokenExpiresIn =
    typeof pr === "object" && pr.expiresIn
      ? parseDuration(pr.expiresIn)
      : undefined;

  const userPasswordResetCallback = config.email.sendPasswordResetEmail;
  const sendResetPasswordEmail = userPasswordResetCallback
    ? async (
        data: { user: { email: string }; url: string; token: string },
      ): Promise<void> => {
        await userPasswordResetCallback({
          email: data.user.email,
          url: data.url,
          token: data.token,
        });
      }
    : undefined;

  const passwordResetEnabled = pr !== false;

  const userCallback = config.email.sendVerificationEmail;
  const sendVerificationEmail = userCallback
    ? async (
        data: { user: { email: string }; url: string; token: string },
      ): Promise<void> => {
        await userCallback({
          email: data.user.email,
          url: data.url,
          token: data.token,
        });
      }
    : undefined;

  const emailVerification: BetterAuthOptions["emailVerification"] =
    ep.requireEmailVerification || userCallback
      ? {
          sendVerificationEmail:
            sendVerificationEmail ?? createSendVerificationFallback(),
          sendOnSignUp: true,
          autoSignInAfterVerification: true,
        }
      : undefined;

  return {
    emailAndPassword: {
      enabled: true,
      disableSignUp: ep.disableSignUp,
      requireEmailVerification: ep.requireEmailVerification,
      minPasswordLength: ep.passwordMinLength,
      maxPasswordLength: ep.passwordMaxLength,
      autoSignIn: ep.autoSignIn,
      resetPasswordTokenExpiresIn: resetTokenExpiresIn,
      ...(passwordResetEnabled
        ? {
            sendResetPassword:
              sendResetPasswordEmail ?? createSendPasswordResetFallback(),
          }
        : {}),
    },
    emailVerification,
  };
}

function createSendPasswordResetFallback() {
  return async (data: { user: { email: string }; url: string }): Promise<void> => {
    if (process.env.NODE_ENV === "production") {
      console.error(
        `[BetterAuth] sendPasswordResetEmail callback not configured. ` +
          `Password reset will not work for ${data.user.email}. ` +
          `Set email.sendPasswordResetEmail in auth.config.ts`,
      );
      return;
    }
    console.warn(
      `[BetterAuth] No sendPasswordResetEmail callback configured. ` +
        `Logging password reset email for ${data.user.email}: ${data.url}`,
    );
  };
}

function createSendVerificationFallback() {
  return async (data: { user: { email: string }; url: string }): Promise<void> => {
    if (process.env.NODE_ENV === "production") {
      console.error(
        `[BetterAuth] sendVerificationEmail callback not configured. ` +
          `Email verification will not work for ${data.user.email}. ` +
          `Set email.sendVerificationEmail in auth.config.ts`,
      );
      return;
    }
    console.warn(
      `[BetterAuth] No sendVerificationEmail callback configured. ` +
        `Logging verification email for ${data.user.email}: ${data.url}`,
    );
  };
}

function mapOAuth(
  config: AuthConfig,
): Pick<BetterAuthOptions, "socialProviders"> {
  const oauth = config.features.oauth;
  const socialProviders: BetterAuthOptions["socialProviders"] = {};

  if (oauth.github?.enabled) {
    socialProviders.github = {
      clientId: oauth.github.clientId,
      clientSecret: oauth.github.clientSecret,
    };
  }

  if (oauth.google?.enabled) {
    socialProviders.google = {
      clientId: oauth.google.clientId,
      clientSecret: oauth.google.clientSecret,
    };
  }

  for (const provider of oauth.custom ?? []) {
    if (!provider.enabled) continue;
    (socialProviders as Record<string, unknown>)[provider.id] = {
      clientId: provider.clientId,
      clientSecret: provider.clientSecret,
    };
  }

  return { socialProviders };
}

/**
 * Maps our config-driven session settings to Better Auth's native format.
 *
 * Note: Better Auth has NO explicit `session.strategy` option. The "JWT vs
 * database" strategy is determined implicitly:
 * - JWT (default): session data is encoded in a client-side JWT cookie.
 * - Database: session is stored in the database via the adapter. This happens
 *   automatically when a database adapter is configured in `auth.config.ts`;
 *   no explicit flag is needed.
 *
 * Our `SessionConfig.strategy` field in `auth.config.ts` serves as
 * user-facing documentation for this behavior.
 */
function mapSession(
  session: AuthConfig["session"],
): Pick<BetterAuthOptions, "session"> {
  return {
    session: {
      expiresIn: parseDuration(session.expiresIn),
      updateAge: session.updateAge ? parseDuration(session.updateAge) : undefined,
      cookieCache: session.cookieCache ? { enabled: true } : undefined,
    },
  };
}

function mapAdvanced(
  config: AuthConfig,
): Pick<BetterAuthOptions, "advanced"> {
  return {
    advanced: {
      cookies: {
        session_token: {
          name: config.session.cookieName,
        },
      },
    },
  };
}

function resolvePlugins(
  config: AuthConfig,
): BetterAuthOptions["plugins"] {
  const plugins: BetterAuthPlugin[] = [];

  plugins.push(nextCookies() as BetterAuthPlugin);

  if (config.features.twoFactor.enabled) {
    plugins.push(twoFactor() as BetterAuthPlugin);
  }

  return plugins as [];
}

function buildUserConfig(
  config: AuthConfig,
): BetterAuthOptions["user"] {
  const roles = config.features.roles;
  if (!roles.enabled) {
    return undefined;
  }

  return {
    additionalFields: {
      role: {
        type: roles.roles,
        required: true,
        defaultValue: roles.defaultRole,
        input: false,
      },
    },
  };
}
