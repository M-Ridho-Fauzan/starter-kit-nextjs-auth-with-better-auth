import type { z } from "zod";
import {
  AuthConfigSchema,
  DatabaseConfig as DatabaseConfigSchema,
  SessionConfig as SessionConfigSchema,
  EmailPasswordConfig as EmailPasswordConfigSchema,
  PasswordResetConfig as PasswordResetConfigSchema,
  OAuthConfig as OAuthConfigSchema,
  OAuthProviderConfig as OAuthProviderConfigSchema,
  TwoFactorConfig as TwoFactorConfigSchema,
  RolesConfig as RolesConfigSchema,
  FeaturesConfig as FeaturesConfigSchema,
  UiConfig as UiConfigSchema,
  EmailConfig as EmailConfigSchema,
} from "./schema";

/** Fully resolved output type (all defaults applied). */
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
/** Partial input type (fields with defaults are optional). */
export type AuthConfigInput = z.input<typeof AuthConfigSchema>;

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type EmailPasswordConfig = z.infer<typeof EmailPasswordConfigSchema>;
export type PasswordResetConfig = z.infer<typeof PasswordResetConfigSchema>;
export type OAuthConfig = z.infer<typeof OAuthConfigSchema>;
export type OAuthProviderConfig = z.infer<typeof OAuthProviderConfigSchema>;
export type TwoFactorConfig = z.infer<typeof TwoFactorConfigSchema>;
export type RolesConfig = z.infer<typeof RolesConfigSchema>;
export type FeaturesConfig = z.infer<typeof FeaturesConfigSchema>;
export type UiConfig = z.infer<typeof UiConfigSchema>;
export type EmailConfig = z.infer<typeof EmailConfigSchema>;
