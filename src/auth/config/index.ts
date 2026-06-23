import { AuthConfigSchema } from "./schema";
import type { AuthConfig, AuthConfigInput } from "./types";

export { AuthConfigSchema };

/**
 * Validate and return a fully resolved auth configuration.
 *
 * Parses the user-provided config through the Zod schema, applying all
 * defaults and coercions. The returned {@link AuthConfig} is the canonical
 * representation consumed by the rest of the framework.
 *
 * @param config - Partial user configuration (all optional fields get defaults).
 * @returns Fully resolved configuration with all defaults applied.
 *
 * @example
 * ```ts
 * // auth.config.ts
 * import { defineAuthConfig } from "@/auth/config";
 *
 * export default defineAuthConfig({
 *   database: { adapter: "prisma", url: process.env.DATABASE_URL! },
 *   features: { emailPassword: { enabled: true } },
 * });
 * ```
 */
export function defineAuthConfig(config: AuthConfigInput): AuthConfig {
  return AuthConfigSchema.parse(config);
}

/** Fully resolved auth configuration output type. */
export type { AuthConfig } from "./types";
/** Partial input type accepted by {@link defineAuthConfig}. */
export type { AuthConfigInput } from "./types";
/** Database connection configuration (adapter type + URL or client instance). */
export type { DatabaseConfig } from "./types";
/** Session lifetime and storage strategy configuration. */
export type { SessionConfig } from "./types";
/** Container for all feature toggles. */
export type { FeaturesConfig } from "./types";
/** Email + password authentication feature configuration. */
export type { EmailPasswordConfig } from "./types";
/** Password reset flow configuration. */
export type { PasswordResetConfig } from "./types";
/** OAuth provider configuration (GitHub, Google, custom). */
export type { OAuthConfig } from "./types";
/** Single OAuth provider credentials. */
export type { OAuthProviderConfig } from "./types";
/** Two-factor authentication (TOTP) configuration. */
export type { TwoFactorConfig } from "./types";
/** Role-based access control configuration. */
export type { RolesConfig } from "./types";
/** UI theme and redirect path configuration. */
export type { UiConfig } from "./types";
/** Email callback configuration (verification, password reset emails). */
export type { EmailConfig } from "./types";
