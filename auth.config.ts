/**
 * Auth configuration entry point.
 *
 * Customize this file to match your application's needs.
 * All values flow from here — zero hardcoding in the source.
 *
 * @see https://opencode.ai/docs/auth-config
 *
 * ─── Email Provider Setup ───
 *
 * The `email` section allows you to send real emails. By default, emails
 * are logged to the console in development. To send real emails:
 *
 * 1. Pick a provider (e.g. Resend, Nodemailer, SendGrid)
 * 2. Install the provider package:
 *    - Resend:  pnpm add resend
 *    - Nodemailer: pnpm add nodemailer @types/nodemailer
 * 3. Uncomment and update the callbacks below
 */
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  /*
   * Email provider callbacks.
   *
   * By default, emails are logged to the console in development.
   * To send real emails, uncomment and configure the callbacks below.
   *
   * @example
   * ```ts
   * import { Resend } from "resend";
   * const resend = new Resend(process.env.RESEND_API_KEY!);
   * ```
   */
  database: {
    adapter: "prisma",
    url: process.env.DATABASE_URL!,
  },
  features: {
    emailPassword: {
      enabled: true,
      requireEmailVerification: false,
      passwordMinLength: 8,
    },
    passwordReset: true,
    oauth: {
      github: {
        enabled: false,
        clientId: process.env.GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      },
      google: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
    },
    twoFactor: {
      enabled: false,
      methods: ["totp"],
    },
    roles: {
      enabled: false,
      defaultRole: "user",
      roles: ["user", "admin"],
    },
  },
  session: {
    expiresIn: "7d",
    strategy: "jwt",
    cookieName: "auth_session",
  },
  ui: {
    theme: "shadcn",
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/",
  },
});
