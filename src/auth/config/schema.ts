import { z } from "zod";

// ─── Helpers ───

const DurationString = z.string().regex(/^\d+[smhd]$/, {
  message: "Must be a duration string like '7d', '1h', '30m'",
});

// ─── Email Section (callbacks) ───

/**
 * User-facing callback type for sending emails.
 * Simpler than Better Auth's internal signature — the mapper bridges the gap.
 */
export type SendVerificationEmailCallback = (params: {
  email: string;
  url: string;
  token: string;
}) => Promise<void>;

export type SendPasswordResetEmailCallback = (params: {
  email: string;
  url: string;
  token: string;
}) => Promise<void>;

export const EmailConfig = z.object({
  sendVerificationEmail: z
    .custom<SendVerificationEmailCallback>()
    .optional(),
  sendPasswordResetEmail: z
    .custom<SendPasswordResetEmailCallback>()
    .optional(),
});

// ─── Database Section ───

export const DatabaseAdapter = z.enum(["prisma", "drizzle", "kysely", "mongoose"]);

export const DatabaseConfig = z.object({
  adapter: DatabaseAdapter,
  url: z.string().optional(),
  client: z.unknown().optional(),
});

// ─── Session Section ───

export const SessionStrategy = z.enum(["jwt", "database"]);

export const SessionConfig = z.object({
  expiresIn: DurationString.default("7d"),
  strategy: SessionStrategy.default("jwt"),
  cookieName: z.string().default("auth_session"),
  updateAge: DurationString.optional(),
  cookieCache: z.boolean().default(false),
});

// ─── Features Section ───

export const EmailPasswordConfig = z.object({
  enabled: z.boolean().default(false),
  requireEmailVerification: z.boolean().default(false),
  passwordMinLength: z.number().min(1).default(8),
  passwordMaxLength: z.number().max(256).default(128),
  disableSignUp: z.boolean().default(false),
  autoSignIn: z.boolean().default(true),
});

export const PasswordResetConfig = z
  .union([
    z.boolean(),
    z.object({
      expiresIn: DurationString.optional(),
    }),
  ])
  .default(false);

export const OAuthProviderConfig = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string(),
  clientSecret: z.string(),
});

export const OAuthConfig = z.object({
  github: OAuthProviderConfig.optional(),
  google: OAuthProviderConfig.optional(),
  custom: z
    .array(
      z.object({
        id: z.string(),
        clientId: z.string(),
        clientSecret: z.string(),
        enabled: z.boolean().default(true),
      }),
    )
    .optional(),
});

export const TwoFactorConfig = z.object({
  enabled: z.boolean().default(false),
  methods: z.array(z.enum(["totp"])).default(["totp"]),
});

export const RolesConfig = z.object({
  enabled: z.boolean().default(false),
  defaultRole: z.string().default("user"),
  roles: z.array(z.string()).default(["user", "admin"]),
});

export const FeaturesConfig = z.object({
  emailPassword: EmailPasswordConfig.default({}),
  passwordReset: PasswordResetConfig,
  oauth: OAuthConfig.default({}),
  twoFactor: TwoFactorConfig.default({}),
  roles: RolesConfig.default({}),
});

// ─── UI Section ───

export const UiConfig = z.object({
  theme: z.enum(["shadcn"]).default("shadcn"),
  redirectAfterLogin: z.string().default("/dashboard"),
  redirectAfterLogout: z.string().default("/"),
  twoFactorSettingsPath: z.string().default("/settings/2fa"),
  protectedPaths: z.array(z.string()).default(["/dashboard", "/settings"]),
  roleRestrictions: z.record(z.string(), z.array(z.string())).default({
    "/admin": ["admin"],
  }),
});

// ─── Root ───

export const AuthConfigSchema = z.object({
  email: EmailConfig.default({}),
  database: DatabaseConfig,
  features: FeaturesConfig.default({}),
  session: SessionConfig.default({}),
  ui: UiConfig.default({}),
});
